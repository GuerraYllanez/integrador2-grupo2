import { apiFetch } from "./client";

export type HistoriaClinicaRequest = {
  idPaciente: number;
  codigoHistoria: string;
  antecedentes?: string;
  alergias?: string;
  observaciones?: string;
};

export type HistoriaClinicaResponse = {
  idHistoria: number;
  codigoHistoria: string;
  antecedentes?: string;
  alergias?: string;
  observaciones?: string;
  paciente?: {
    idPaciente?: number;
    nombres?: string;
    apellidos?: string;
    documento?: string;
  };
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export const historiasApi = {
  list: () =>
    apiFetch<HistoriaClinicaResponse[]>("/api/historias"),

  get: (id: number | string) =>
    apiFetch<HistoriaClinicaResponse>(
      `/api/historias/${id}`
    ),

  getByPaciente: (idPaciente: number | string) =>
    apiFetch<HistoriaClinicaResponse>(
      `/api/historias/paciente/${idPaciente}`
    ),

  create: (data: HistoriaClinicaRequest) =>
    apiFetch<HistoriaClinicaResponse>("/api/historias", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number | string,
    data: HistoriaClinicaRequest
  ) =>
    apiFetch<HistoriaClinicaResponse>(
      `/api/historias/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  delete: (id: number | string) =>
    apiFetch<void>(`/api/historias/${id}`, {
      method: "DELETE",
    }),
};