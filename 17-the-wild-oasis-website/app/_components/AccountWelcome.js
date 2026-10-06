"use client";

import { useSession } from "../_lib/auth";

function AccountWelcome() {
  const session = useSession();

  const firstName = session.user.name.split(" ").at(0);

  return (
    <h2 className="font-semibold text-2xl text-accent-400 mb-7">
      Welcome, {firstName}
    </h2>
  );
}

export default AccountWelcome;
