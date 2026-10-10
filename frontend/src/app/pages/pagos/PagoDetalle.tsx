import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  pagosApi,
  type PagoResponse,
} from "../../api/pagosApi";

export default function PagoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pago, setPago] = useState<PagoResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPago = async () => {
      if (!id) {
        setError("No se indicó el pago.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const data = await pagosApi.get(id);

        setPago(data);
      } catch (err) {
        const mensaje =
          err instanceof Error
            ? err.message
            : "No se pudo cargar el pago.";

        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarPago();
  }, [id]);

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(monto);
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) {
      return "-";
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return fecha;
    }

    return valor.toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const obtenerClaseEstado = (
    estado: PagoResponse["estado"]
  ) => {
    if (estado === "PAGADO") {
      return "bg-green-100 text-green-700";
    }

    if (estado === "ANULADO") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  if (cargando) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-500">
        Cargando información del pago...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/pagos")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a pagos
        </button>
      </div>
    );
  }

  if (!pago) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          No se encontró el pago.
        </div>

        <button
          type="button"
          onClick={() => navigate("/pagos")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a pagos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Detalle del pago
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Información del pago registrado en el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pagos")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Pago
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                #{pago.idPago}
              </h2>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${obtenerClaseEstado(
                pago.estado
              )}`}
            >
              {pago.estado}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Paciente
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {pago.paciente}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Documento:{" "}
              {pago.documentoPaciente || "No registrado"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Cita
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {pago.idCita
                ? `Cita #${pago.idCita}`
                : "Sin cita asociada"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Servicio
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {pago.servicio}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Precio del servicio:{" "}
              {pago.precioServicio !== null
                ? formatearMonto(pago.precioServicio)
                : "No disponible"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Monto pagado
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatearMonto(pago.monto)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Método de pago
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {pago.metodoPago}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Fecha de pago
            </p>

            <p className="mt-1 text-sm text-gray-900">
              {formatearFecha(pago.fechaPago)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Referencia
            </p>

            <p className="mt-1 text-sm text-gray-900">
              {pago.referencia || "No registrada"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Observaciones
            </p>

            <p className="mt-1 text-sm text-gray-900">
              {pago.observaciones || "Sin observaciones"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}