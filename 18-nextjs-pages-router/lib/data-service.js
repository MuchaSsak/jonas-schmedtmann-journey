// Demo mode: data comes from local seed data instead of Supabase
import { cabins } from './data-cabins';

export async function getCabin(id) {
  const data = cabins.find((cabin) => cabin.id === Number(id)) ?? null;

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (!data) {
    console.error(`Cabin #${id} not found`);
  }

  return data;
}

export async function getCabins() {
  const data = cabins
    .map(({ id, name, maxCapacity, regularPrice, discount, image }) => ({
      id,
      name,
      maxCapacity,
      regularPrice,
      discount,
      image,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return data;
}
