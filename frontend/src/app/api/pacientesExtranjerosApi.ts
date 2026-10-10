import { apiFetch } from "./client";

export type TipoDocumentoExtranjero =
  | "PASAPORTE"
  | "CE";

export type EstadoCobertura =
  | "PENDIENTE"
  | "VALIDADA"
  | "RECHAZADA";

export type EstadoCartaGarantia =
  | "NO_SOLICITADA"
  | "SOLICITADA"
  | "RECIBIDA";

export interface PacienteExtranjeroPaciente {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono?: string;
  correo?: string;
}

export interface PacienteExtranjero {
  idExtranjero: number;
  paciente: PacienteExtranjeroPaciente;

  nacionalidad: string;
  tipoDocumento: TipoDocumentoExtranjero;
  numeroDocumento: string;

  cobertura: string;
  especialidad?: string;

  estadoCobertura: EstadoCobertura;
  cartaGarantia: EstadoCartaGarantia;

  observaciones?: string;
  fechaRegistro?: string;
}

export interface PacienteExtranjeroRequest {
  idPaciente: number;

  nacionalidad: string;
  tipoDocumento: TipoDocumentoExtranjero;
  numeroDocumento: string;

  cobertura: string;
  especialidad?: string;

  estadoCobertura?: EstadoCobertura;
  cartaGarantia?: EstadoCartaGarantia;

  observaciones?: string;
}


// ============================================================
// LISTAR
// ============================================================

export async function listarPacientesExtranjeros(): Promise<
  PacienteExtranjero[]
> {
  return apiFetch<PacienteExtranjero[]>(
    "/api/pacientes-extranjeros"
  );
}


// ============================================================
// OBTENER
// ============================================================

export async function obtenerPacienteExtranjero(
  id: number
): Promise<PacienteExtranjero> {
  return apiFetch<PacienteExtranjero>(
    `/api/pacientes-extranjeros/${id}`
  );
}


// ============================================================
// CREAR
// ============================================================

export async function crearPacienteExtranjero(
  data: PacienteExtranjeroRequest
): Promise<PacienteExtranjero> {
  return apiFetch<PacienteExtranjero>(
    "/api/pacientes-extranjeros",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


// ============================================================
// ACTUALIZAR
// ============================================================

export async function actualizarPacienteExtranjero(
  id: number,
  data: PacienteExtranjeroRequest
): Promise<PacienteExtranjero> {
  return apiFetch<PacienteExtranjero>(
    `/api/pacientes-extranjeros/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}


// ============================================================
// VALIDAR COBERTURA
// ============================================================

export async function validarCobertura(
  id: number
): Promise<PacienteExtranjero> {
  return apiFetch<PacienteExtranjero>(
    `/api/pacientes-extranjeros/${id}/validar-cobertura`,
    {
      method: "PUT",
    }
  );
}


// ============================================================
// SOLICITAR CARTA DE GARANTÍA
// ============================================================

export async function solicitarCartaGarantia(
  id: number
): Promise<PacienteExtranjero> {
  return apiFetch<PacienteExtranjero>(
    `/api/pacientes-extranjeros/${id}/solicitar-carta`,
    {
      method: "PUT",
    }
  );
}


// ============================================================
// ELIMINAR
// ============================================================

export async function eliminarPacienteExtranjero(
  id: number
): Promise<void> {
  await apiFetch<void>(
    `/api/pacientes-extranjeros/${id}`,
    {
      method: "DELETE",
    }
  );
}