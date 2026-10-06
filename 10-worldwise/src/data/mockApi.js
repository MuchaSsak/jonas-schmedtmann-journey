// Demo mode: stands in for the json-server API (`npm run server` on
// localhost:9000). Answers the same /cities requests with a fake delay and
// keeps the data in localStorage, so the app runs without a backend.
import seed from "./cities.json";

const STORAGE_KEY = "10-worldwise:cities";

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) return stored;
  } catch {
    // Ignore broken data and start again from the seed
  }
  return structuredClone(seed.cities);
}

function save(cities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  } catch {
    // Storage can be full or blocked; the data then only lives in memory
  }
}

let cities = load();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function mockFetch(url, { method = "GET", body } = {}) {
  await wait(500);

  const [, resource, id] = new URL(url).pathname.split("/");
  if (resource !== "cities") return respond({}, 404);

  if (method === "GET" && !id) return respond(cities);

  if (method === "GET") {
    const city = cities.find((city) => String(city.id) === id);
    return city ? respond(city) : respond({}, 404);
  }

  if (method === "POST") {
    const newCity = { ...JSON.parse(body), id: Date.now() };
    cities = [...cities, newCity];
    save(cities);
    return respond(newCity, 201);
  }

  if (method === "DELETE") {
    cities = cities.filter((city) => String(city.id) !== id);
    save(cities);
    return respond({});
  }

  return respond({}, 405);
}
