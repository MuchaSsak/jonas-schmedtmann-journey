import {
  fakeDelay,
  fileToDataUrl,
  getDb,
  getSession,
  nowISO,
  saveDb,
  setSession,
} from "./mockDb";

// Never expose the password stored in the mock DB
function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export async function signup({ fullName, email, password }) {
  await fakeDelay();
  const db = getDb();

  if (
    db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())
  )
    throw new Error("User already registered");

  const user = {
    id: createId(),
    aud: "authenticated",
    role: "authenticated",
    email,
    password,
    created_at: nowISO(),
    user_metadata: {
      fullName,
      avatar: "",
    },
  };

  db.users.push(user);
  saveDb(db);

  // Like Supabase with email confirmation: the new user doesn't get logged in
  return { user: publicUser(user), session: null };
}

export async function login({ email, password }) {
  await fakeDelay();
  const { users } = getDb();

  const user = users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
  );

  if (!user) throw new Error("Invalid login credentials");

  const session = { userId: user.id, created_at: nowISO() };
  setSession(session);

  return { user: publicUser(user), session };
}

export async function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  await fakeDelay();
  const user = getDb().users.find((user) => user.id === session.userId);

  if (!user) {
    setSession(null);
    return null;
  }
  return publicUser(user);
}

export async function logout() {
  await fakeDelay();
  setSession(null);
}

export async function updateCurrentUser({ password, fullName, avatar }) {
  await fakeDelay();
  const session = getSession();
  if (!session) throw new Error("Auth session missing!");

  // 1. Upload the avatar image (downscaled and stored as a data URL)
  let avatarUrl;
  if (avatar) avatarUrl = await fileToDataUrl(avatar);

  const db = getDb();
  const user = db.users.find((user) => user.id === session.userId);
  if (!user) throw new Error("User not found");

  // 2. Update password OR fullName
  if (password) {
    if (password === user.password)
      throw new Error(
        "New password should be different from the old password."
      );
    user.password = password;
  }
  if (fullName) user.user_metadata.fullName = fullName;

  // 3. Update avatar in the user
  if (avatarUrl) user.user_metadata.avatar = avatarUrl;

  user.updated_at = nowISO();
  saveDb(db);

  return { user: publicUser(user) };
}
