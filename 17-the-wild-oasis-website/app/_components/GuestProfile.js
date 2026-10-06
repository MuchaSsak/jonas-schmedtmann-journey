"use client";

import { useSession } from "../_lib/auth";
import { getGuest } from "../_lib/data-service";
import { useLocalData } from "../_lib/useLocalData";
import SelectCountry from "./SelectCountry";
import Spinner from "./Spinner";
import UpdateProfileForm from "./UpdateProfileForm";

function GuestProfile() {
  const session = useSession();
  const guest = useLocalData(
    () => getGuest(session.user.email),
    [session.user.email]
  );

  if (!guest) return <Spinner />;

  return (
    <UpdateProfileForm guest={guest}>
      <SelectCountry
        name="nationality"
        id="nationality"
        className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
        defaultCountry={guest.nationality}
      />
    </UpdateProfileForm>
  );
}

export default GuestProfile;
