import { apiFetch } from "./client";

export interface ReprogramacionRequest {
  idCita: number;
  nuevaFecha: string;
  nuevaHora: string;
  motivo?: string;
}

export interface ReprogramacionResponse {
  idReprogramacion: number;
  idCita: number;
  idPaciente: number;
  idOdontologo: number;
  fechaAnterior: string;
  horaAnterior: string;
  nuevaFecha: string;
  nuevaHora: string;
  motivo: string;
  fechaReprogramacion: string | null;
}

export const reprogramacionesApi = {

  async list(): Promise<ReprogramacionResponse[]> {
    return apiFetch<ReprogramacionResponse[]>(
      "/api/reprogramaciones"
    );
  },

  async get(
    id: number | string
  ): Promise<ReprogramacionResponse> {

    return apiFetch<ReprogramacionResponse>(
      `/api/reprogramaciones/${id}`
    );
  },

  async create(
    data: ReprogramacionRequest
  ): Promise<ReprogramacionResponse> {

    return apiFetch<ReprogramacionResponse>(
      "/api/reprogramaciones",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  async update(
    id: number | string,
    data: ReprogramacionRequest
  ): Promise<ReprogramacionResponse> {

    return apiFetch<ReprogramacionResponse>(
      `/api/reprogramaciones/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  async delete(
    id: number | string
  ): Promise<void> {

    return apiFetch<void>(
      `/api/reprogramaciones/${id}`,
      {
        method: "DELETE",
      }
    );
  },
};