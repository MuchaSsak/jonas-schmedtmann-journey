"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Server actions could call redirect() from next/navigation. Our mocked
// actions run in the browser (outside of React), so the root layout registers
// the app router here once, and the actions call redirect() from this file.

let appRouter = null;

export function RouterRegistry() {
  const router = useRouter();

  useEffect(() => {
    appRouter = router;
  }, [router]);

  return null;
}

export function redirect(path) {
  if (appRouter) appRouter.push(path);
  else window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH}${path}`);
}
