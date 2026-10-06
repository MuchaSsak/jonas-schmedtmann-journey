import { useMemo, useSyncExternalStore } from "react";
import { createGuest, getGuest } from "./data-service";
import { cabins } from "./data/data-cabins";
import { getDemoGuestBookings } from "./data/data-bookings";
import {
  getItem,
  getRawItem,
  removeItem,
  revalidatePath,
  setItem,
  subscribe,
} from "./storage";

// Client-side mock of NextAuth: "Continue with Google" signs in a demo guest,
// and the session lives in localStorage (no Google account, no server)

const SESSION_KEY = "session";

const demoUser = {
  name: "Demo Guest",
  email: "demo.guest@example.com",
  image: `${process.env.NEXT_PUBLIC_BASE_PATH}/default-user.jpg`,
};

export async function auth() {
  return getItem(SESSION_KEY);
}

export async function signIn() {
  // Same as the NextAuth signIn callback: create the guest on the first login
  let guest = await getGuest(demoUser.email);

  if (!guest) {
    guest = await createGuest({
      email: demoUser.email,
      fullName: demoUser.name,
      nationality: "Portugal",
      countryFlag: "https://flagcdn.com/pt.svg",
      nationalID: "",
    });

    // Give the demo guest a couple of reservations to play with
    const bookings = getItem("bookings", []);
    const maxId = Math.max(100, ...bookings.map((booking) => booking.id));
    const demoBookings = getDemoGuestBookings(guest.id, cabins).map(
      (booking, i) => ({ id: maxId + i + 1, ...booking })
    );
    setItem("bookings", [...bookings, ...demoBookings]);
  }

  // Same as the NextAuth session callback: add the guestId to the session
  setItem(SESSION_KEY, { user: { ...demoUser, guestId: guest.id } });
  await revalidatePath("/");
}

export async function signOut() {
  removeItem(SESSION_KEY);
  await revalidatePath("/");
}

// undefined = not known yet (static HTML and hydration), null = signed out
export function useSession() {
  const rawSession = useSyncExternalStore(
    subscribe,
    () => getRawItem(SESSION_KEY),
    () => undefined
  );

  return useMemo(() => {
    if (rawSession === undefined) return undefined;

    try {
      return rawSession ? JSON.parse(rawSession) : null;
    } catch {
      return null;
    }
  }, [rawSession]);
}
