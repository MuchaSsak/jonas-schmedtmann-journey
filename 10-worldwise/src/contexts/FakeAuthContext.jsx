import { createContext, useContext, useReducer } from "react";

const AuthContext = createContext();

const SESSION_KEY = "10-worldwise:user";

function getInitialState() {
  try {
    const user = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (user) return { user, isAuthenticated: true };
  } catch {
    // Not logged in
  }
  return { user: null, isAuthenticated: false };
}

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...state, user: null, isAuthenticated: false };
    default:
      throw new Error("Unknown action");
  }
}

const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
  avatar: "https://i.pravatar.cc/100?u=zz",
};

function AuthProvider({ children }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    null,
    getInitialState
  );

  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(FAKE_USER));
      dispatch({ type: "login", payload: FAKE_USER });
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    dispatch({ type: "logout" });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext was used outside AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
