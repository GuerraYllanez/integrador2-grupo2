import { apiFetch } from "./client";

export type LoginResponse = {
  token: string;
  tipo: string;
  correo: string;
  rol: string;
  nombreUsuario: string;
};

export type LoginRequest = { correo: string; contrasena: string };

export async function login(data: LoginRequest) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
