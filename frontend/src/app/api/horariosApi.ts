import { apiFetch } from "./client";

export type EstadoHorario =
  | "DISPONIBLE"
  | "OCUPADO"
  | "BLOQUEADO";

export type HorarioRequest = {
  idOdontologo: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado?: EstadoHorario;
};

export type HorarioResponse = {
  idHorario: number;
  idOdontologo: number;
  odontologo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoHorario;
};

export const horariosApi = {
  list: () =>
    apiFetch<HorarioResponse[]>("/api/horarios"),

  get: (id: number | string) =>
    apiFetch<HorarioResponse>(
      `/api/horarios/${id}`,
    ),

  disponibles: () =>
    apiFetch<HorarioResponse[]>(
      "/api/horarios/disponibles",
    ),

  create: (data: HorarioRequest) =>
    apiFetch<HorarioResponse>("/api/horarios", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number | string,
    data: HorarioRequest,
  ) =>
    apiFetch<HorarioResponse>(
      `/api/horarios/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    ),

  delete: (id: number | string) =>
    apiFetch<void>(
      `/api/horarios/${id}`,
      {
        method: "DELETE",
      },
    ),
};