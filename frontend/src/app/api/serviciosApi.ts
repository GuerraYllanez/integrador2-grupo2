import { apiFetch } from "./client";

export interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  estado: boolean;
  fechaCreacion: string | null;
}

export interface ServicioRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  estado?: boolean;
}

export const serviciosApi = {
  list: () =>
    apiFetch<Servicio[]>("/api/servicios"),

  get: (id: number | string) =>
    apiFetch<Servicio>(`/api/servicios/${id}`),

  create: (data: ServicioRequest) =>
    apiFetch<Servicio>("/api/servicios", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number | string,
    data: ServicioRequest
  ) =>
    apiFetch<Servicio>(`/api/servicios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) =>
    apiFetch<void>(`/api/servicios/${id}`, {
      method: "DELETE",
    }),
};