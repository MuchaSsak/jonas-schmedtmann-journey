// Tiny localStorage "database" that replaces Supabase in this static demo.
// Everything is namespaced, so it doesn't clash with other apps on the same domain.

const PREFIX = "17-the-wild-oasis-website:";

export function getItem(key, fallback = null) {
  if (typeof window === "undefined") return fallback;

  try {
    const value = localStorage.getItem(PREFIX + key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

// Raw string value, used as a stable snapshot for useSyncExternalStore
export function getRawItem(key) {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    throw new Error("Data could not be saved");
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}

/////////////
// Subscriptions (our replacement for revalidatePath)

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Re-runs every client-side data loader (and session subscriber), so the UI
// shows the fresh data. Like Next's revalidatePath, but for the whole app.
export async function revalidatePath() {
  await Promise.all([...listeners].map((listener) => listener()));
}

// Fake network delay, so pending states and spinners still show up
export function fakeDelay(ms = 600) {
  return new Promise((res) => setTimeout(res, ms));
}
