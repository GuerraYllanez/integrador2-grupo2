import { useContext } from "react";
import { AuthContext, type AuthUser, type AuthContextType } from "../types/auth";

export { AuthContext };
export type { AuthUser, AuthContextType };
export const useAuth = () => useContext(AuthContext);
