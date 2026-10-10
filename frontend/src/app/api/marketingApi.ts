import { apiFetch } from "./client";

export interface Marketing {
  idMarketing: number;
  idUsuario?: number | null;
  nombreCampana: string;
  descripcion?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  estado: boolean;
  fechaCreacion?: string | null;
}

export interface MarketingRequest {
  nombreCampana: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: boolean;
}

export const marketingApi = {
  // ============================================================
  // LISTAR
  // ============================================================

  list: () =>
    apiFetch<Marketing[]>("/api/marketing"),

  // ============================================================
  // OBTENER POR ID
  // ============================================================

  get: (id: number | string) =>
    apiFetch<Marketing>(
      `/api/marketing/${id}`
    ),

  // ============================================================
  // CREAR
  // ============================================================

  create: (data: MarketingRequest) =>
    apiFetch<Marketing>("/api/marketing", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  update: (
    id: number | string,
    data: MarketingRequest
  ) =>
    apiFetch<Marketing>(
      `/api/marketing/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  // ============================================================
  // DESACTIVAR
  // ============================================================

  deactivate: (id: number | string) =>
    apiFetch<void>(
      `/api/marketing/${id}/desactivar`,
      {
        method: "PUT",
      }
    ),

  // ============================================================
  // ELIMINAR DEFINITIVAMENTE
  // ============================================================

  delete: (id: number | string) =>
    apiFetch<void>(
      `/api/marketing/${id}`,
      {
        method: "DELETE",
      }
    ),
};