"use client";

import { useSearchParams } from "next/navigation";
import { getBooking, getCabin } from "../_lib/data-service";
import { updateBooking } from "../_lib/actions";
import { useLocalData } from "../_lib/useLocalData";
import SubmitButton from "./SubmitButton";
import Spinner from "./Spinner";

// Bookings are created at runtime, so they can't be pre-rendered as
// /edit/[bookingId] pages. The id comes from the query string instead:
// /account/reservations/edit/?bookingId=123
function EditReservationForm() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const data = useLocalData(async () => {
    const booking = await getBooking(bookingId);
    const cabin = await getCabin(booking.cabinId);
    return { booking, cabin };
  }, [bookingId]);

  if (!data) return <Spinner />;

  const { numGuests, observations } = data.booking;
  const { maxCapacity } = data.cabin;

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{bookingId}
      </h2>

      <form
        action={updateBooking}
        className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
      >
        <input type="hidden" value={bookingId} name="bookingId" />

        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            defaultValue={numGuests}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            defaultValue={observations}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          <SubmitButton pendingLabel="Updating...">
            Update reservation
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

export default EditReservationForm;
