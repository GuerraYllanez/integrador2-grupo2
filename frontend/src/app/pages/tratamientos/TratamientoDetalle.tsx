import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import {
  tratamientosApi,
  type EstadoTratamiento,
  type TratamientoResponse,
} from "../../api/tratamientosApi";

const estados: Array<{
  value: EstadoTratamiento;
  label: string;
}> = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
  },
  {
    value: "EN_PROCESO",
    label: "En proceso",
  },
  {
    value: "FINALIZADO",
    label: "Finalizado",
  },
  {
    value: "CANCELADO",
    label: "Cancelado",
  },
];

function obtenerEtiquetaEstado(
  estado: EstadoTratamiento
): string {
  return (
    estados.find(
      (item) => item.value === estado
    )?.label ?? estado
  );
}

function obtenerClaseEstado(
  estado: EstadoTratamiento
): string {
  switch (estado) {
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-800";

    case "EN_PROCESO":
      return "bg-blue-100 text-blue-800";

    case "FINALIZADO":
      return "bg-green-100 text-green-800";

    case "CANCELADO":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatearFecha(
  fecha?: string
): string {
  if (!fecha) {
    return "No registrada";
  }

  const partes = fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMoneda(
  valor?: number
): string {
  if (
    valor === undefined ||
    valor === null
  ) {
    return "S/ 0.00";
  }

  return `S/ ${Number(valor).toFixed(2)}`;
}

export default function TratamientoDetalle() {
  const { id } = useParams();

  const [tratamiento, setTratamiento] =
    useState<TratamientoResponse | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function cargarDetalle() {
      if (!id) {
        setError(
          "No se especificó el tratamiento."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const data =
          await tratamientosApi.get(id);

        setTratamiento(data);
      } catch (err) {
        console.error(
          "Error al cargar el detalle del tratamiento:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar el tratamiento."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Detalle del tratamiento
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Cargando información...
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Cargando tratamiento...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Detalle del tratamiento
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            No fue posible obtener la información.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-800">
            Se produjo un error.
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>
        </div>

        <div>
          <Link
            to="/tratamientos"
            className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Volver a tratamientos
          </Link>
        </div>
      </div>
    );
  }

  if (!tratamiento) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tratamiento no encontrado
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            No existe información para el tratamiento solicitado.
          </p>
        </div>

        <Link
          to="/tratamientos"
          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Volver a tratamientos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Gestión de tratamientos
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Tratamiento #{tratamiento.idTratamiento}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${obtenerClaseEstado(
                tratamiento.estado
              )}`}
            >
              {obtenerEtiquetaEstado(
                tratamiento.estado
              )}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Información detallada del tratamiento odontológico.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/tratamientos"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Volver
          </Link>

          <Link
            to={`/tratamientos/${tratamiento.idTratamiento}/editar`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Editar tratamiento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Información del paciente
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Paciente
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {tratamiento.paciente}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Historia clínica
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {tratamiento.codigoHistoria}
              </p>
            </div>

          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Información profesional
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Odontólogo
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {tratamiento.odontologo}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Especialidad
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {tratamiento.especialidad ||
                  "Sin especialidad registrada"}
              </p>
            </div>

          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Información del tratamiento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Servicio
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {tratamiento.servicio}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Precio del servicio
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatearMoneda(
                  tratamiento.precioServicio
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Fecha de inicio
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatearFecha(
                  tratamiento.fechaInicio
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Fecha de finalización
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatearFecha(
                  tratamiento.fechaFin
                )}
              </p>
            </div>

          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Descripción y observaciones
            </h2>
          </div>

          <div className="space-y-5 p-5">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Descripción
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {tratamiento.descripcion ||
                  "Sin descripción registrada."}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Observaciones
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {tratamiento.observaciones ||
                  "Sin observaciones registradas."}
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}