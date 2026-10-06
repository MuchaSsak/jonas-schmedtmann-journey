import { add, isFuture, isPast, isToday } from "date-fns";

// Seed bookings (same as the course's 15-the-wild-oasis/src/data/data-bookings.js).
// Dates are relative to today, so the date picker always has some booked days.

function fromToday(numDays, withTime = false) {
  const date = add(new Date(), { days: numDays });
  if (!withTime) date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, -1);
}

function getStatus(startDate, endDate) {
  if (isPast(new Date(endDate)) && !isToday(new Date(endDate)))
    return "checked-out";
  if (isFuture(new Date(startDate))) return "unconfirmed";
  // Guests arriving today are already checked in
  return "checked-in";
}

// [cabinId, guestId, startDate, endDate, numGuests]
const seedBookings = [
  // CABIN 001
  [1, 2, 0, 7, 1],
  [1, 3, -23, -13, 2],
  [1, 4, 12, 18, 2],
  // CABIN 002
  [2, 5, -45, -29, 2],
  [2, 6, 15, 18, 2],
  [2, 7, 33, 48, 2],
  // CABIN 003
  [3, 8, -25, -20, 4],
  [3, 9, -2, 0, 3],
  [3, 10, -14, -11, 4],
  // CABIN 004
  [4, 11, -4, 8, 4],
  [4, 12, 12, 17, 4],
  [4, 13, 18, 19, 1],
  // CABIN 005
  [5, 14, 14, 21, 5],
  [5, 15, -6, -4, 4],
  [5, 16, -4, -1, 6],
  // CABIN 006
  [6, 17, 0, 11, 6],
  [6, 18, -16, -9, 4],
  [6, 19, -4, -1, 6],
  // CABIN 007
  [7, 20, 17, 23, 8],
  [7, 21, 40, 50, 7],
  [7, 22, 32, 37, 6],
  // CABIN 008
  [8, 1, -5, 0, 9],
  [8, 23, 0, 5, 10],
  [8, 24, 10, 13, 7],
];

export const bookings = seedBookings.map(
  ([cabinId, guestId, start, end, numGuests], i) => {
    const startDate = fromToday(start);
    const endDate = fromToday(end);

    return {
      id: i + 1,
      created_at: fromToday(Math.min(start, 0) - 10, true),
      startDate,
      endDate,
      numNights: end - start,
      numGuests,
      cabinId,
      guestId,
      status: getStatus(startDate, endDate),
    };
  }
);

// A couple of reservations for the demo guest, created on the first login,
// so the reservations page isn't empty. They don't overlap the seed bookings.
// [cabinId, startDate, endDate, numGuests, observations]
const demoGuestBookings = [
  [1, -40, -35, 2, ""],
  [3, 22, 26, 3, "We will arrive late in the evening."],
  [5, 30, 37, 4, ""],
];

export function getDemoGuestBookings(guestId, cabins) {
  return demoGuestBookings.map(
    ([cabinId, start, end, numGuests, observations]) => {
      const { regularPrice, discount } = cabins.find(
        (cabin) => cabin.id === cabinId
      );
      const startDate = fromToday(start);
      const endDate = fromToday(end);
      const cabinPrice = (end - start) * (regularPrice - discount);

      return {
        created_at: fromToday(Math.min(start, 0) - 14, true),
        startDate,
        endDate,
        numNights: end - start,
        numGuests,
        cabinPrice,
        extrasPrice: 0,
        totalPrice: cabinPrice,
        isPaid: start < 0,
        hasBreakfast: false,
        observations,
        status: getStatus(startDate, endDate),
        cabinId,
        guestId,
      };
    }
  );
}
