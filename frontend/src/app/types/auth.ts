import { createContext } from "react";

export type AuthUser = {
  name: string;
  role: string;
  username: string;
  avatar: string;
  token: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {},
});
