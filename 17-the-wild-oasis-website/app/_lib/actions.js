// In the course these are server actions ("use server") that write to Supabase.
// This static demo has no server, so they are plain client-side functions with
// the same names and arguments, writing to localStorage instead.

import { auth, signIn, signOut } from "./auth";
import { getBookings } from "./data-service";
import { fakeDelay, getItem, revalidatePath, setItem } from "./storage";
import { redirect } from "./router";

export async function updateGuest(formData) {
  await fakeDelay();

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const guests = getItem("guests", []);
  setItem(
    "guests",
    guests.map((guest) =>
      guest.id === session.user.guestId ? { ...guest, ...updateData } : guest
    )
  );

  await revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  await fakeDelay();

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const bookings = getItem("bookings", []);

  const newBooking = {
    ...bookingData,
    id: Math.max(100, ...bookings.map((booking) => booking.id)) + 1,
    created_at: new Date().toISOString(),
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  setItem("bookings", [...bookings, newBooking]);

  await revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  await fakeDelay();

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  const bookings = getItem("bookings", []);
  setItem(
    "bookings",
    bookings.filter((booking) => booking.id !== bookingId)
  );

  await revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  await fakeDelay();

  // 1) Authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2) Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to update this booking");

  // 3) Building update data
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  // 4) Mutation
  const bookings = getItem("bookings", []);
  setItem(
    "bookings",
    bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, ...updateData } : booking
    )
  );

  // 5) Revalidation
  await revalidatePath("/account/reservations");

  // 6) Redirecting
  redirect("/account/reservations");
}

export async function signInAction() {
  await fakeDelay();
  await signIn("google");
  redirect("/account");
}

export async function signOutAction() {
  await signOut();
  redirect("/");
}
