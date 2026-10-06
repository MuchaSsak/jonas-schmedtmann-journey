import { notFound } from "next/navigation";
import { eachDayOfInterval } from "date-fns";
import { cabins } from "./data/data-cabins";
import { bookings as seedBookings } from "./data/data-bookings";
import { settings } from "./data/data-settings";
import { countries } from "./data/data-countries";
import { getItem, setItem } from "./storage";

// This static demo has no Supabase. Cabins, settings and countries are seed
// data shipped with the app (so they can be used at build time). Guests and
// their bookings live in the browser's localStorage (see storage.js).

/////////////
// GET

export async function getCabin(id) {
  const data = cabins.find((cabin) => cabin.id === Number(id));

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (!data) notFound();

  return data;
}

export async function getCabinPrice(id) {
  const { regularPrice, discount } = await getCabin(id);

  return { regularPrice, discount };
}

export const getCabins = async function () {
  const data = cabins
    .map(({ id, name, maxCapacity, regularPrice, discount, image }) => ({
      id,
      name,
      maxCapacity,
      regularPrice,
      discount,
      image,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  return data;
};

// Guests are uniquely identified by their email address
export async function getGuest(email) {
  const data = getItem("guests", []).find((guest) => guest.email === email);

  // No error here! We handle the possibility of no guest in the sign in callback
  return data ?? null;
}

export async function getBooking(id) {
  const data = getItem("bookings", []).find(
    (booking) => booking.id === Number(id)
  );

  if (!data) throw new Error("Booking could not get loaded");

  return data;
}

export async function getBookings(guestId) {
  const data = getItem("bookings", [])
    .filter((booking) => booking.guestId === guestId)
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need
    .map((booking) => {
      const { name, image } = cabins.find(
        (cabin) => cabin.id === booking.cabinId
      );
      return { ...booking, cabins: { name, image } };
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return data;
}

export async function getBookedDatesByCabinId(cabinId) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Getting all bookings (seed bookings + the ones created in this browser)
  const data = [...seedBookings, ...getItem("bookings", [])].filter(
    (booking) =>
      booking.cabinId === Number(cabinId) &&
      (new Date(booking.startDate) >= today || booking.status === "checked-in")
  );

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  // await new Promise((res) => setTimeout(res, 5000));

  return settings;
}

export async function getCountries() {
  return countries;
}

/////////////
// CREATE

export async function createGuest(newGuest) {
  const guests = getItem("guests", []);
  const data = {
    id: Math.max(1000, ...guests.map((guest) => guest.id)) + 1,
    created_at: new Date().toISOString(),
    ...newGuest,
  };

  setItem("guests", [...guests, data]);

  return data;
}
