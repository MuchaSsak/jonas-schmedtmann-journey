import { useEffect, useState } from "react";
import { subscribe } from "./storage";

// Loads data that only exists in the browser (localStorage), and loads it
// again whenever an action calls revalidatePath(). undefined = still loading.
export function useLocalData(loader, deps) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(
    function () {
      let ignore = false;

      async function load() {
        try {
          const result = await loader();
          if (!ignore) setData(result);
        } catch (err) {
          if (!ignore) setError(err);
        }
      }

      load();
      const unsubscribe = subscribe(load);

      return () => {
        ignore = true;
        unsubscribe();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  // Let the closest error boundary (error.js / not-found.js) handle it
  if (error) throw error;

  return data;
}
