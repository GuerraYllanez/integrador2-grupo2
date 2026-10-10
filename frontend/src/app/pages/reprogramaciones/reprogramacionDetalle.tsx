import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router";

import {
  reprogramacionesApi,
  type ReprogramacionResponse,
} from "../../api/reprogramacionesApi";

function formatearFecha(
  fecha: string | null | undefined
) {
  if (!fecha) {
    return "-";
  }

  const partes = fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearHora(
  hora: string | null | undefined
) {
  if (!hora) {
    return "-";
  }

  return hora.length >= 5
    ? hora.substring(0, 5)
    : hora;
}

function formatearFechaHora(
  fecha: string | null | undefined,
  hora: string | null | undefined
) {
  if (!fecha) {
    return "-";
  }

  return `${formatearFecha(fecha)} ${formatearHora(hora)}`;
}

function formatearFechaRegistro(
  fecha: string | null | undefined
) {
  if (!fecha) {
    return "-";
  }

  const valor = fecha.replace("T", " ");

  if (valor.length >= 16) {
    return valor.substring(0, 16);
  }

  return valor;
}

export default function ReprogramacionDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [reprogramacion, setReprogramacion] =
    useState<ReprogramacionResponse | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDetalle() {
      if (!id) {
        setError(
          "No se indicó el identificador de la reprogramación."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const data =
          await reprogramacionesApi.get(id);

        setReprogramacion(data);
      } catch (err) {
        const mensaje =
          err instanceof Error
            ? err.message
            : "No se pudo cargar la reprogramación.";

        setError(mensaje);
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
        Cargando reprogramación...
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
          onClick={() => navigate("/reprogramaciones")}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!reprogramacion) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          No se encontró la reprogramación.
        </div>

        <button
          type="button"
          onClick={() => navigate("/reprogramaciones")}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Detalle de reprogramación
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Información del cambio realizado en la cita.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/reprogramaciones")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Datos de la cita
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Reprogramación
              </p>

              <p className="mt-1 text-sm text-gray-900">
                #{reprogramacion.idReprogramacion}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Cita
              </p>

              <p className="mt-1 text-sm text-gray-900">
                #{reprogramacion.idCita}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Paciente
              </p>

              <p className="mt-1 text-sm text-gray-900">
                Paciente #{reprogramacion.idPaciente}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Odontólogo
              </p>

              <p className="mt-1 text-sm text-gray-900">
                Odontólogo #{reprogramacion.idOdontologo}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Cambio de fecha y hora
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Fecha y hora anterior
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatearFechaHora(
                  reprogramacion.fechaAnterior,
                  reprogramacion.horaAnterior
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Nueva fecha y hora
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatearFechaHora(
                  reprogramacion.nuevaFecha,
                  reprogramacion.nuevaHora
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">
            Motivo de la reprogramación
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {reprogramacion.motivo || "Sin motivo registrado."}
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">
            Registro
          </h2>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Fecha de reprogramación
            </p>

            <p className="mt-1 text-sm text-gray-900">
              {formatearFechaRegistro(
                reprogramacion.fechaReprogramacion
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}