// A tiny local "database" that replaces Supabase, so the app works without any backend.
// All data lives in localStorage (namespaced), and is seeded from src/data on first load.
import { isFuture, isPast, isToday } from "date-fns";
import { subtractDates } from "../utils/helpers";

import { bookings as seedBookings } from "../data/data-bookings";
import { cabins as seedCabins } from "../data/data-cabins";
import { guests as seedGuests } from "../data/data-guests";

const PREFIX = "15-the-wild-oasis:";
const DB_KEY = `${PREFIX}db`;
const SESSION_KEY = `${PREFIX}session`;
const DB_VERSION = 1;

export const DEMO_EMAIL = "jonas@example.com";
export const DEMO_PASSWORD = "pass0dev";

const initialSettings = {
  id: 1,
  minBookingLength: 3,
  maxBookingLength: 30,
  maxGuestsPerBooking: 10,
  breakfastPrice: 15,
};

let memoryDb = null;
let memorySession = null;

// Simulated network latency, so that loading spinners still show
export function fakeDelay() {
  const ms = 200 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function nowISO() {
  return new Date().toISOString();
}

// Start of the current UTC day (same as getToday() in helpers)
function todayStartMs() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today.getTime();
}

// The seed data strings have no time zone ("2023-05-10T00:00:00.000"). Supabase stored them as UTC
function toUTC(dateStr) {
  return /Z$|[+-]\d\d:\d\d$/.test(dateStr) ? dateStr : `${dateStr}Z`;
}

export function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

/////////////////////////////////////////
// SEED DATA

export function createSeedGuests() {
  return seedGuests.map((guest, i) => ({
    id: i + 1,
    created_at: nowISO(),
    ...guest,
  }));
}

export function createSeedCabins() {
  return seedCabins.map((cabin, i) => ({
    id: i + 1,
    created_at: nowISO(),
    ...cabin,
  }));
}

// Same logic as the course Uploader: prices and status are computed from the dates relative to today
export function createSeedBookings(cabinRows, guestRows) {
  const allGuestIds = guestRows.map((guest) => guest.id).sort((a, b) => a - b);
  const allCabinIds = cabinRows.map((cabin) => cabin.id).sort((a, b) => a - b);

  return seedBookings
    .map((booking, i) => {
      // Here relying on the order of cabins, as they don't have and ID yet
      const cabin = seedCabins.at(booking.cabinId - 1);
      const numNights = subtractDates(booking.endDate, booking.startDate);
      const cabinPrice = numNights * (cabin.regularPrice - cabin.discount);
      const extrasPrice = booking.hasBreakfast
        ? numNights * 15 * booking.numGuests
        : 0; // hardcoded breakfast price
      const totalPrice = cabinPrice + extrasPrice;

      let status;
      if (
        isPast(new Date(booking.endDate)) &&
        !isToday(new Date(booking.endDate))
      )
        status = "checked-out";
      if (
        isFuture(new Date(booking.startDate)) ||
        isToday(new Date(booking.startDate))
      )
        status = "unconfirmed";
      if (
        (isFuture(new Date(booking.endDate)) ||
          isToday(new Date(booking.endDate))) &&
        isPast(new Date(booking.startDate)) &&
        !isToday(new Date(booking.startDate))
      )
        status = "checked-in";

      return {
        id: i + 1,
        ...booking,
        created_at: toUTC(booking.created_at),
        startDate: toUTC(booking.startDate),
        endDate: toUTC(booking.endDate),
        numNights,
        cabinPrice,
        extrasPrice,
        totalPrice,
        guestId: allGuestIds.at(booking.guestId - 1),
        cabinId: allCabinIds.at(booking.cabinId - 1),
        status,
      };
    })
    .filter((booking) => booking.guestId && booking.cabinId);
}

function createSeedDb() {
  const guests = createSeedGuests();
  const cabins = createSeedCabins();

  return {
    version: DB_VERSION,
    // Bookings dates are relative to this day. When the app is opened on a later day, all dates get shifted, so the dashboard always looks "alive"
    anchorDay: todayStartMs(),
    cabins,
    guests,
    bookings: createSeedBookings(cabins, guests),
    settings: { ...initialSettings, created_at: nowISO() },
    users: [
      {
        id: "8a2c1f0e-demo-4c5b-9f1a-000000000001",
        aud: "authenticated",
        role: "authenticated",
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        created_at: nowISO(),
        user_metadata: { fullName: "Jonas", avatar: "" },
      },
    ],
  };
}

function shiftDates(db) {
  const diff = todayStartMs() - db.anchorDay;
  if (!diff) return false;

  const shift = (dateStr) =>
    new Date(new Date(dateStr).getTime() + diff).toISOString();

  db.bookings = db.bookings.map((booking) => ({
    ...booking,
    created_at: shift(booking.created_at),
    startDate: shift(booking.startDate),
    endDate: shift(booking.endDate),
  }));
  db.anchorDay = todayStartMs();
  return true;
}

/////////////////////////////////////////
// READ / WRITE

// Always returns a fresh copy, so that callers can mutate it freely before saving
export function getDb() {
  let db = null;
  try {
    db = JSON.parse(localStorage.getItem(DB_KEY));
  } catch (err) {
    db = null;
  }
  if (!db && memoryDb) db = clone(memoryDb);

  if (!db || db.version !== DB_VERSION) {
    db = createSeedDb();
    saveDb(db);
  } else if (shiftDates(db)) saveDb(db);

  return db;
}

export function saveDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    // Quota exceeded: don't pretend the data was saved
    if (err?.name === "QuotaExceededError" || err?.code === 22)
      throw new Error("Not enough browser storage to save this data");
    // localStorage not available at all (e.g. blocked): keep data in memory only
  }
  memoryDb = clone(db);
}

export function getSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    return memorySession;
  }
}

export function setSession(session) {
  memorySession = session;
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    // ignore, session is kept in memory
  }
}

/////////////////////////////////////////
// IMAGES

// Reads an image file, downscales it on a canvas and returns a small JPEG data URL (stored in localStorage)
export function fileToDataUrl(file, maxWidth = 400) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/"))
      return reject(new Error("Not an image file"));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Image could not be read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image could not be read"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
