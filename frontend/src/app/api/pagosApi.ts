import { apiFetch } from "./client";

export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA"
  | "YAPE"
  | "PLIN"
  | "TRANSFERENCIA";

export type EstadoPago =
  | "PENDIENTE"
  | "PAGADO"
  | "ANULADO";

export type PagoRequest = {
  idPaciente: number;
  idCita?: number | null;
  idServicio: number;
  monto: number;
  metodoPago: MetodoPago;
  estado?: EstadoPago;
  referencia?: string;
  observaciones?: string;
};

export type PagoResponse = {
  idPago: number;
  idPaciente: number;
  paciente: string;
  documentoPaciente: string | null;

  idCita: number | null;

  idServicio: number;
  servicio: string;
  precioServicio: number | null;

  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoPago;

  fechaPago: string | null;

  referencia: string | null;
  observaciones: string | null;
};

export const pagosApi = {
  list: () =>
    apiFetch<PagoResponse[]>("/api/pagos"),

  get: (id: number | string) =>
    apiFetch<PagoResponse>(`/api/pagos/${id}`),

  create: (data: PagoRequest) =>
    apiFetch<PagoResponse>("/api/pagos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number | string,
    data: PagoRequest
  ) =>
    apiFetch<PagoResponse>(`/api/pagos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) =>
    apiFetch<void>(`/api/pagos/${id}`, {
      method: "DELETE",
    }),
};