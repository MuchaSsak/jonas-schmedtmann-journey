import { fakeDelay, getDb, saveDb } from "./mockDb";

export async function getSettings() {
  await fakeDelay();
  const { settings } = getDb();

  if (!settings) throw new Error("Settings could not be loaded");
  return settings;
}

// We expect a newSetting object that looks like {setting: newValue}
export async function updateSetting(newSetting) {
  await fakeDelay();
  const db = getDb();

  // Values come from number inputs (strings), but are stored as numbers, like in the DB
  const values = Object.fromEntries(
    Object.entries(newSetting).map(([field, value]) => [field, Number(value)])
  );

  if (Object.values(values).some((value) => Number.isNaN(value)))
    throw new Error("Settings could not be updated");

  // There is only ONE row of settings, and it has the ID=1, and so this is the updated one
  db.settings = { ...db.settings, ...values, id: 1 };
  saveDb(db);

  return db.settings;
}
