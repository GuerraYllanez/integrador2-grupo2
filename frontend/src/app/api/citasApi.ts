import { apiFetch } from "./client";

export type EstadoCita =
  | "PROGRAMADA"
  | "ATENDIDA"
  | "CANCELADA"
  | "REPROGRAMADA";

export type CitaRequest = {
  idPaciente: number;
  idOdontologo: number;
  idPersonal?: number;
  idServicio: number;
  idHorario?: number;
  fechaCita: string;
  horaCita: string;
  motivo?: string;
  estado?: EstadoCita;
  observaciones?: string;
};

export type CitaResponse = {
  idCita: number;

  idPaciente: number;
  paciente: string;
  documentoPaciente?: string;

  idOdontologo: number;
  odontologo: string;
  especialidad?: string;

  idPersonal?: number;
  personal?: string;

  idServicio: number;
  servicio: string;
  precioServicio?: number;

  idHorario?: number;

  fechaCita: string;
  horaCita: string;

  motivo?: string;

  estado: EstadoCita;

  observaciones?: string;

  fechaRegistro?: string;
};

export const citasApi = {
  list: () =>
    apiFetch<CitaResponse[]>(
      "/api/citas"
    ),

  get: (id: number | string) =>
    apiFetch<CitaResponse>(
      `/api/citas/${id}`
    ),

  create: (data: CitaRequest) =>
    apiFetch<CitaResponse>(
      "/api/citas",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  update: (
    id: number | string,
    data: CitaRequest
  ) =>
    apiFetch<CitaResponse>(
      `/api/citas/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  delete: (id: number | string) =>
    apiFetch<void>(
      `/api/citas/${id}`,
      {
        method: "DELETE",
      }
    ),
};