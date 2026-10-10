
import { apiFetch } from "./client";

/**
 * Estructura de un registro de auditoría
 * que devuelve el backend de ODAM.
 */
export interface Auditoria {
  idAuditoria: number;
  idUsuario: number | null;
  nombreUsuario: string;
  correo: string | null;
  accion: string;
  tablaAfectada: string | null;
  idRegistro: number | null;
  descripcion: string | null;
  fecha: string | null;
}

/**
 * Operaciones disponibles para consultar
 * el módulo de auditoría.
 */
export const auditoriaApi = {
  /**
   * Obtiene todos los registros de auditoría.
   * Endpoint: GET /api/auditoria
   */
  list: () =>
    apiFetch<Auditoria[]>("/api/auditoria"),

  /**
   * Obtiene un registro por su identificador.
   * Endpoint: GET /api/auditoria/{id}
   */
  get: (id: number | string) =>
    apiFetch<Auditoria>(`/api/auditoria/${id}`),
};