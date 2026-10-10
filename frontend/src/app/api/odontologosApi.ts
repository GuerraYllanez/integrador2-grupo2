import { apiFetch } from "./client";

export interface Odontologo {
  idOdontologo: number;
  idUsuario?: number | null;
  nombres: string;
  apellidos: string;
  especialidad?: string | null;
  colegiatura: string;
  telefono?: string | null;
  correo?: string | null;
  estado: boolean;
  fechaRegistro?: string | null;
}

export interface OdontologoRequest {
  nombres: string;
  apellidos: string;
  especialidad?: string;
  colegiatura: string;
  telefono?: string;
  correo?: string;
  estado?: boolean;
}

export const odontologosApi = {
  list: () =>
    apiFetch<Odontologo[]>("/api/odontologos"),

  get: (id: number | string) =>
    apiFetch<Odontologo>(
      `/api/odontologos/${id}`
    ),

  create: (data: OdontologoRequest) =>
    apiFetch<Odontologo>("/api/odontologos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number | string,
    data: OdontologoRequest
  ) =>
    apiFetch<Odontologo>(
      `/api/odontologos/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  delete: (id: number | string) =>
    apiFetch<void>(
      `/api/odontologos/${id}`,
      {
        method: "DELETE",
      }
    ),
};