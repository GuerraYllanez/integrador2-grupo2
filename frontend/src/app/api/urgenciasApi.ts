import { apiFetch } from "./client";

export type EstadoUrgencia =
  | "ACTIVA"
  | "EN_ATENCION"
  | "RESUELTA";

export interface PacienteUrgencia {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
}

export interface HistoriaUrgencia {
  idHistoria: number;
  codigoHistoria: string;
}

export interface UrgenciaDental {
  idUrgencia: number;
  paciente: PacienteUrgencia;
  historiaClinica: HistoriaUrgencia;
  tipoUrgencia: string;
  descripcion: string;
  estado: EstadoUrgencia;
  fechaRegistro?: string;
}

export interface UrgenciaDentalRequest {
  idPaciente: number;
  idHistoria: number;
  tipoUrgencia: string;
  descripcion: string;
  estado?: EstadoUrgencia;
}

export async function listarUrgencias(): Promise<UrgenciaDental[]> {
  return apiFetch<UrgenciaDental[]>("/api/urgencias");
}

export async function listarUrgenciasActivas(): Promise<UrgenciaDental[]> {
  return apiFetch<UrgenciaDental[]>("/api/urgencias/activas");
}

export async function obtenerUrgencia(
  id: number
): Promise<UrgenciaDental> {
  return apiFetch<UrgenciaDental>(
    `/api/urgencias/${id}`
  );
}

export async function crearUrgencia(
  data: UrgenciaDentalRequest
): Promise<UrgenciaDental> {
  return apiFetch<UrgenciaDental>(
    "/api/urgencias",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarUrgencia(
  id: number,
  data: UrgenciaDentalRequest
): Promise<UrgenciaDental> {
  return apiFetch<UrgenciaDental>(
    `/api/urgencias/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarEstadoUrgencia(
  id: number,
  estado: EstadoUrgencia
): Promise<UrgenciaDental> {
  return apiFetch<UrgenciaDental>(
    `/api/urgencias/${id}/estado?estado=${encodeURIComponent(
      estado
    )}`,
    {
      method: "PUT",
    }
  );
}

export async function eliminarUrgencia(
  id: number
): Promise<void> {
  await apiFetch<void>(
    `/api/urgencias/${id}`,
    {
      method: "DELETE",
    }
  );
}