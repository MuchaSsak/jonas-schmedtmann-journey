import { Suspense } from "react";
import CabinList from "../_components/CabinList";
import Spinner from "../_components/Spinner";
import Counter from "../_components/Counter";
import Filter from "../_components/Filter";
import ReservationReminder from "../_components/ReservationReminder";
import { getCabins } from "../_lib/data-service";

export const metadata = {
  title: "Cabins",
};

// Static export: searchParams can't be read on the server, so the capacity
// filter is applied in CabinList on the client (useSearchParams)
export default async function Page() {
  const cabins = await getCabins();

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-10">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little
        home away from home. The perfect spot for a peaceful, calm vacation.
        Welcome to paradise.
      </p>

      <div className="flex justify-end mb-8">
        <Suspense>
          <Filter />
        </Suspense>
      </div>

      <Suspense fallback={<Spinner />}>
        <CabinList cabins={cabins} />
        <ReservationReminder />
      </Suspense>
    </div>
  );
}
