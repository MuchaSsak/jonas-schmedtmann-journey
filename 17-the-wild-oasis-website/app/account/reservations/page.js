import GuestReservations from "@/app/_components/GuestReservations";

export const metadata = {
  title: "Reservations",
};

export default function Page() {
  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Your reservations
      </h2>

      <GuestReservations />
    </div>
  );
}
