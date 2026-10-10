import { apiFetch } from "./client";

export type EvaluacionClinicaRequest = {
  idHistoria: number;
  idOdontologo: number;
  fechaEvaluacion: string;
  diagnostico?: string;
  observaciones?: string;
  recomendaciones?: string;
};

export const evaluacionesApi = {
  list: () =>
    apiFetch<unknown[]>("/api/evaluaciones"),

  get: (id: number | string) =>
    apiFetch<unknown>("/api/evaluaciones/" + id),

  getByHistoria: (idHistoria: number | string) =>
    apiFetch<unknown[]>(
      "/api/evaluaciones/historia/" + idHistoria
    ),

  getByOdontologo: (idOdontologo: number | string) =>
    apiFetch<unknown[]>(
      "/api/evaluaciones/odontologo/" + idOdontologo
    ),

  create: (data: EvaluacionClinicaRequest) =>
    apiFetch<unknown>("/api/evaluaciones", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number | string,
    data: EvaluacionClinicaRequest
  ) =>
    apiFetch<unknown>("/api/evaluaciones/" + id, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) =>
    apiFetch<void>("/api/evaluaciones/" + id, {
      method: "DELETE",
    }),
};