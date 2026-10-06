import { getToday } from "../utils/helpers";
import { fakeDelay, getDb, saveDb } from "./mockDb";
import { PAGE_SIZE } from "../utils/constants";

// Helpers to mimic the Supabase query features used below

function pick(obj, fields) {
  if (!obj) return null;
  if (!fields) return { ...obj };
  return Object.fromEntries(fields.map((field) => [field, obj[field]]));
}

// Like Supabase's .select("..., cabins(name), guests(fullName, email)")
function joinBooking(booking, db, cabinFields, guestFields) {
  return {
    ...booking,
    cabins: pick(
      db.cabins.find((cabin) => cabin.id === booking.cabinId),
      cabinFields
    ),
    guests: pick(
      db.guests.find((guest) => guest.id === booking.guestId),
      guestFields
    ),
  };
}

function toTime(value) {
  return new Date(value).getTime();
}

function compare(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

const filterMethods = {
  eq: (a, b) => String(a) === String(b),
  neq: (a, b) => String(a) !== String(b),
  gt: (a, b) => compare(a, b) > 0,
  gte: (a, b) => compare(a, b) >= 0,
  lt: (a, b) => compare(a, b) < 0,
  lte: (a, b) => compare(a, b) <= 0,
};

export async function getBookings({ filter, sortBy, page }) {
  await fakeDelay();
  const db = getDb();

  let bookings = db.bookings;

  // FILTER
  if (filter) {
    const method = filterMethods[filter.method || "eq"];
    if (!method) throw new Error("Bookings could not be loaded");
    bookings = bookings.filter((booking) =>
      method(booking[filter.field], filter.value)
    );
  }

  // SORT
  if (sortBy) {
    const modifier = sortBy.direction === "asc" ? 1 : -1;
    bookings = [...bookings].sort(
      (a, b) =>
        compare(a[sortBy.field], b[sortBy.field]) * modifier || a.id - b.id
    );
  }

  const count = bookings.length;

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    bookings = bookings.slice(from, to + 1);
  }

  const data = bookings.map((booking) =>
    pick(joinBooking(booking, db, ["name"], ["fullName", "email"]), [
      "id",
      "created_at",
      "startDate",
      "endDate",
      "numNights",
      "numGuests",
      "status",
      "totalPrice",
      "cabins",
      "guests",
    ])
  );

  return { data, count };
}

export async function getBooking(id) {
  await fakeDelay();
  const db = getDb();
  const booking = db.bookings.find((booking) => booking.id === Number(id));

  if (!booking) throw new Error("Booking not found");

  return joinBooking(booking, db);
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
// date: ISOString
export async function getBookingsAfterDate(date) {
  await fakeDelay();
  const { bookings } = getDb();

  const from = toTime(date);
  const to = toTime(getToday({ end: true }));

  return bookings
    .filter(
      (booking) =>
        toTime(booking.created_at) >= from && toTime(booking.created_at) <= to
    )
    .map((booking) => pick(booking, ["created_at", "totalPrice", "extrasPrice"]));
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date) {
  await fakeDelay();
  const db = getDb();

  const from = toTime(date);
  const to = toTime(getToday());

  return db.bookings
    .filter(
      (booking) =>
        toTime(booking.startDate) >= from && toTime(booking.startDate) <= to
    )
    .map((booking) => joinBooking(booking, db, null, ["fullName"]));
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
  await fakeDelay();
  const db = getDb();
  const today = toTime(getToday());

  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))
  return db.bookings
    .filter(
      (booking) =>
        (booking.status === "unconfirmed" &&
          toTime(booking.startDate) === today) ||
        (booking.status === "checked-in" && toTime(booking.endDate) === today)
    )
    .sort((a, b) => toTime(a.created_at) - toTime(b.created_at))
    .map((booking) =>
      joinBooking(booking, db, null, ["fullName", "nationality", "countryFlag"])
    );
}

export async function updateBooking(id, obj) {
  await fakeDelay();
  const db = getDb();
  const index = db.bookings.findIndex((booking) => booking.id === Number(id));

  if (index === -1) throw new Error("Booking could not be updated");

  const data = { ...db.bookings[index], ...obj, id: Number(id) };
  db.bookings[index] = data;
  saveDb(db);

  return data;
}

export async function deleteBooking(id) {
  await fakeDelay();
  const db = getDb();

  if (!db.bookings.some((booking) => booking.id === Number(id)))
    throw new Error("Booking could not be deleted");

  db.bookings = db.bookings.filter((booking) => booking.id !== Number(id));
  saveDb(db);

  return null;
}
