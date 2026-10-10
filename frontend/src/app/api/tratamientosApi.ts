import { apiFetch } from "./client";

export type EstadoTratamiento =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "FINALIZADO"
  | "CANCELADO";

export type TratamientoRequest = {
  idHistoria: number;
  idOdontologo: number;
  idServicio: number;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado?: EstadoTratamiento;
  observaciones?: string;
};

export type TratamientoResponse = {
  idTratamiento: number;
  idHistoria: number;
  codigoHistoria: string;
  paciente: string;
  idOdontologo: number;
  odontologo: string;
  especialidad: string;
  idServicio: number;
  servicio: string;
  precioServicio: number;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: EstadoTratamiento;
  observaciones?: string;
};

export const tratamientosApi = {
  list: () =>
    apiFetch<TratamientoResponse[]>("/api/tratamientos"),

  get: (id: number | string) =>
    apiFetch<TratamientoResponse>(
      `/api/tratamientos/${id}`
    ),

  getByHistoria: (idHistoria: number | string) =>
    apiFetch<TratamientoResponse[]>(
      `/api/tratamientos/historia/${idHistoria}`
    ),

  getByOdontologo: (idOdontologo: number | string) =>
    apiFetch<TratamientoResponse[]>(
      `/api/tratamientos/odontologo/${idOdontologo}`
    ),

  getByEstado: (estado: EstadoTratamiento) =>
    apiFetch<TratamientoResponse[]>(
      `/api/tratamientos/estado/${estado}`
    ),

  create: (data: TratamientoRequest) =>
    apiFetch<TratamientoResponse>(
      "/api/tratamientos",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  update: (
    id: number | string,
    data: TratamientoRequest
  ) =>
    apiFetch<TratamientoResponse>(
      `/api/tratamientos/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  delete: (id: number | string) =>
    apiFetch<void>(
      `/api/tratamientos/${id}`,
      {
        method: "DELETE",
      }
    ),
};