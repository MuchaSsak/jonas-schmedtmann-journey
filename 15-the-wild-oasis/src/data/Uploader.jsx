import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createSeedBookings,
  createSeedCabins,
  createSeedGuests,
  getDb,
  saveDb,
} from "../services/mockDb";
import Button from "../ui/Button";

// No backend anymore: "uploading" sample data just resets the local mock database (users and settings are kept)

// const originalSettings = {
//   minBookingLength: 3,
//   maxBookingLength: 30,
//   maxGuestsPerBooking: 10,
//   breakfastPrice: 15,
// };

async function deleteGuests() {
  const db = getDb();
  db.guests = [];
  saveDb(db);
}

async function deleteCabins() {
  const db = getDb();
  db.cabins = [];
  saveDb(db);
}

async function deleteBookings() {
  const db = getDb();
  db.bookings = [];
  saveDb(db);
}

async function createGuests() {
  const db = getDb();
  db.guests = createSeedGuests();
  saveDb(db);
}

async function createCabins() {
  const db = getDb();
  db.cabins = createSeedCabins();
  saveDb(db);
}

async function createBookings() {
  // Bookings need a guestId and a cabinId, so they use the ids of the guests and cabins currently in the DB
  const db = getDb();
  db.bookings = createSeedBookings(db.cabins, db.guests);
  saveDb(db);
}

function Uploader() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  async function uploadAll() {
    setIsLoading(true);
    // Bookings need to be deleted FIRST
    await deleteBookings();
    await deleteGuests();
    await deleteCabins();

    // Bookings need to be created LAST
    await createGuests();
    await createCabins();
    await createBookings();

    queryClient.invalidateQueries();
    setIsLoading(false);
  }

  async function uploadBookings() {
    setIsLoading(true);
    await deleteBookings();
    await createBookings();
    queryClient.invalidateQueries();
    setIsLoading(false);
  }

  return (
    <div
      style={{
        marginTop: "auto",
        backgroundColor: "var(--color-indigo-100)",
        padding: "8px",
        borderRadius: "5px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <h3>SAMPLE DATA</h3>

      <Button onClick={uploadAll} disabled={isLoading}>
        Upload ALL
      </Button>

      <Button onClick={uploadBookings} disabled={isLoading}>
        Upload bookings ONLY
      </Button>
    </div>
  );
}

export default Uploader;
