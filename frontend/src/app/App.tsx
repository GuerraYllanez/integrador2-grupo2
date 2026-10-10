import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Login } from "./pages/auth/Login";
import { AuthContext, type AuthUser } from "./hooks/useAuth";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (authUser: AuthUser) => {
    sessionStorage.setItem("auth_user", JSON.stringify(authUser));
    sessionStorage.setItem("odam_token", authUser.token);
    setUser(authUser);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("odam_token");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}
