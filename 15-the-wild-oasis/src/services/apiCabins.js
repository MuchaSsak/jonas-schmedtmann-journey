import {
  fakeDelay,
  fileToDataUrl,
  getDb,
  nextId,
  nowISO,
  saveDb,
} from "./mockDb";

export async function getCabins() {
  await fakeDelay();
  const { cabins } = getDb();

  return cabins.sort((a, b) => a.id - b.id);
}

export async function createEditCabin(newCabin, id) {
  await fakeDelay();
  const hasImagePath = typeof newCabin.image === "string";

  // 1. "Upload" image: downscale it and store it as a data URL
  let imagePath = newCabin.image;
  if (newCabin.image && !hasImagePath) {
    try {
      imagePath = await fileToDataUrl(newCabin.image);
    } catch (err) {
      console.error(err);
      throw new Error(
        "Cabin image could not be uploaded and the cabin was not created"
      );
    }
  }

  const cabinData = {
    ...newCabin,
    maxCapacity: Number(newCabin.maxCapacity),
    regularPrice: Number(newCabin.regularPrice),
    discount: Number(newCabin.discount),
    image: imagePath,
  };
  // When editing without choosing a new image, keep the old one
  if (!imagePath) delete cabinData.image;

  // 2. Create/edit cabin
  const db = getDb();
  let data;

  // A) CREATE
  if (!id) {
    data = { ...cabinData, id: nextId(db.cabins), created_at: nowISO() };
    db.cabins.push(data);
  }

  // B) EDIT
  if (id) {
    const index = db.cabins.findIndex((cabin) => cabin.id === Number(id));
    if (index === -1) throw new Error("Cabin could not be created");

    data = { ...db.cabins[index], ...cabinData, id: Number(id) };
    db.cabins[index] = data;
  }

  try {
    saveDb(db);
  } catch (err) {
    console.error(err);
    throw new Error("Cabin could not be created");
  }

  return data;
}

export async function deleteCabin(id) {
  await fakeDelay();
  const db = getDb();

  if (!db.cabins.some((cabin) => cabin.id === id))
    throw new Error("Cabin could not be deleted");

  db.cabins = db.cabins.filter((cabin) => cabin.id !== id);
  // Also delete the bookings of this cabin, so no booking points to a missing cabin
  db.bookings = db.bookings.filter((booking) => booking.cabinId !== id);
  saveDb(db);

  return null;
}
