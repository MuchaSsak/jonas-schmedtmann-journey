"use client";

import { useSearchParams } from "next/navigation";
import CabinCard from "@/app/_components/CabinCard";

// Static export: no searchParams on the server, so the capacity filter is
// read and applied on the client (the page wraps this in <Suspense>)
function CabinList({ cabins }) {
  const searchParams = useSearchParams();
  const filter = searchParams.get("capacity") ?? "all";

  if (!cabins.length) return null;

  let displayedCabins;
  if (filter === "all") displayedCabins = cabins;
  if (filter === "small")
    displayedCabins = cabins.filter((cabin) => cabin.maxCapacity <= 3);
  if (filter === "medium")
    displayedCabins = cabins.filter(
      (cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7
    );
  if (filter === "large")
    displayedCabins = cabins.filter((cabin) => cabin.maxCapacity >= 8);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
      {displayedCabins.map((cabin) => (
        <CabinCard cabin={cabin} key={cabin.id} />
      ))}
    </div>
  );
}

export default CabinList;
