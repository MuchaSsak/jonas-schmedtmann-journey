"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../_lib/auth";
import Spinner from "./Spinner";

// Replaces the NextAuth middleware: the session only exists in the browser,
// so the guest area is protected on the client
function ProtectedRoute({ children }) {
  const session = useSession();
  const router = useRouter();

  useEffect(
    function () {
      if (session === null) router.replace("/login");
    },
    [session, router]
  );

  if (!session) return <Spinner />;

  return children;
}

export default ProtectedRoute;
