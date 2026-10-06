"use client";

import Link from "next/link";
import { useSession } from "../_lib/auth";
import { getBookings } from "../_lib/data-service";
import { useLocalData } from "../_lib/useLocalData";
import ReservationList from "./ReservationList";
import Spinner from "./Spinner";

function GuestReservations() {
  const session = useSession();
  const bookings = useLocalData(
    () => getBookings(session.user.guestId),
    [session.user.guestId]
  );

  if (!bookings) return <Spinner />;

  return bookings.length === 0 ? (
    <p className="text-lg">
      You have no reservations yet. Check out our{" "}
      <Link className="underline text-accent-500" href="/cabins">
        luxury cabins &rarr;
      </Link>
    </p>
  ) : (
    <ReservationList bookings={bookings} />
  );
}

export default GuestReservations;
