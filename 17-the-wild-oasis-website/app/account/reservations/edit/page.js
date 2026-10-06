import { Suspense } from "react";
import EditReservationForm from "@/app/_components/EditReservationForm";
import Spinner from "@/app/_components/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditReservationForm />
    </Suspense>
  );
}
