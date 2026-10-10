import { apiFetch } from "./client";

export const pacientesApi = {
  list: () => apiFetch<unknown[]>("/api/pacientes"),
  get: (id: number | string) => apiFetch<unknown>(
    "/api/pacientes/" + id,
  ),
};
