import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { tratamientosApi } from "../../api/tratamientosApi";
import type {
  EstadoTratamiento,
  TratamientoResponse,
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

function obtenerEtiquetaEstado(estado: EstadoTratamiento) {
  return (
    estados.find((item) => item.value === estado)?.label ?? estado
  );
}

function obtenerClaseEstado(estado: EstadoTratamiento) {
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

function formatearFecha(fecha?: string) {
  if (!fecha) {
    return "No registrada";
  }

  const partes = fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMoneda(valor?: number) {
  if (valor === undefined || valor === null) {
    return "S/ 0.00";
  }

  return `S/ ${Number(valor).toFixed(2)}`;
}

export default function Tratamientos() {
  const [tratamientos, setTratamientos] = useState<
    TratamientoResponse[]
  >([]);

  const [estadoFiltro, setEstadoFiltro] = useState<
    EstadoTratamiento | "TODOS"
  >("TODOS");

  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);

  const [eliminandoId, setEliminandoId] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");

  async function cargarTratamientos() {
    try {
      setCargando(true);
      setError("");

      const data = await tratamientosApi.list();

      setTratamientos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Error al cargar los tratamientos:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar los tratamientos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTratamientos();
  }, []);

  async function eliminarTratamiento(
    tratamiento: TratamientoResponse
  ) {
    const confirmar = window.confirm(
      `¿Está seguro de eliminar el tratamiento #${tratamiento.idTratamiento} del paciente ${tratamiento.paciente}?\n\nEsta acción eliminará el registro del tratamiento y no se puede deshacer.`
    );

    if (!confirmar) {
      return;
    }

    try {
      setEliminandoId(tratamiento.idTratamiento);
      setError("");

      await tratamientosApi.delete(
        tratamiento.idTratamiento
      );

      setTratamientos((actuales) =>
        actuales.filter(
          (item) =>
            item.idTratamiento !==
            tratamiento.idTratamiento
        )
      );
    } catch (err) {
      console.error(
        "Error al eliminar el tratamiento:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible eliminar el tratamiento."
      );
    } finally {
      setEliminandoId(null);
    }
  }

  const tratamientosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return tratamientos.filter((tratamiento) => {
      const coincideEstado =
        estadoFiltro === "TODOS" ||
        tratamiento.estado === estadoFiltro;

      if (!coincideEstado) {
        return false;
      }

      if (!termino) {
        return true;
      }

      const contenido = [
        tratamiento.paciente,
        tratamiento.codigoHistoria,
        tratamiento.odontologo,
        tratamiento.especialidad,
        tratamiento.servicio,
        tratamiento.descripcion,
        tratamiento.observaciones,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenido.includes(termino);
    });
  }, [tratamientos, estadoFiltro, busqueda]);

  const resumen = useMemo(() => {
    return {
      total: tratamientos.length,

      pendientes: tratamientos.filter(
        (item) => item.estado === "PENDIENTE"
      ).length,

      enProceso: tratamientos.filter(
        (item) => item.estado === "EN_PROCESO"
      ).length,

      finalizados: tratamientos.filter(
        (item) => item.estado === "FINALIZADO"
      ).length,
    };
  }, [tratamientos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestión de Tratamientos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            T01-T02: Inicio, seguimiento de sesiones y alta
            dental del paciente
          </p>
        </div>

        <Link
          to="/tratamientos/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Nuevo tratamiento
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total de tratamientos
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {resumen.total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pendientes
          </p>

          <p className="mt-2 text-2xl font-semibold text-yellow-600">
            {resumen.pendientes}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            En proceso
          </p>

          <p className="mt-2 text-2xl font-semibold text-blue-600">
            {resumen.enProceso}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Finalizados
          </p>

          <p className="mt-2 text-2xl font-semibold text-green-600">
            {resumen.finalizados}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label
              htmlFor="busqueda"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Buscar tratamiento
            </label>

            <input
              id="busqueda"
              type="text"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              placeholder="Paciente, historia clínica, odontólogo o servicio"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="estado"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Estado
            </label>

            <select
              id="estado"
              value={estadoFiltro}
              onChange={(event) =>
                setEstadoFiltro(
                  event.target.value as
                    | EstadoTratamiento
                    | "TODOS"
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="TODOS">
                Todos los estados
              </option>

              {estados.map((estado) => (
                <option
                  key={estado.value}
                  value={estado.value}
                >
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Se produjo un error.
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={cargarTratamientos}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Tratamientos registrados
              </h2>

              <p className="text-sm text-gray-500">
                Información obtenida directamente del sistema
                odontológico.
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {tratamientosFiltrados.length} resultado
              {tratamientosFiltrados.length !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        {cargando ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500">
              Cargando tratamientos...
            </p>
          </div>
        ) : tratamientosFiltrados.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="text-base font-medium text-gray-900">
              No se encontraron tratamientos
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Prueba cambiando los filtros o registra un nuevo
              tratamiento.
            </p>

            <Link
              to="/tratamientos/nuevo"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Registrar tratamiento
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tratamientosFiltrados.map((tratamiento) => (
              <div
                key={tratamiento.idTratamiento}
                className="p-5 transition hover:bg-gray-50"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {tratamiento.paciente}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${obtenerClaseEstado(
                              tratamiento.estado
                            )}`}
                          >
                            {obtenerEtiquetaEstado(
                              tratamiento.estado
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          Historia clínica:{" "}
                          <span className="font-medium text-gray-700">
                            {tratamiento.codigoHistoria}
                          </span>
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs text-gray-500">
                          ID del tratamiento
                        </p>

                        <p className="font-semibold text-gray-900">
                          #{tratamiento.idTratamiento}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Servicio
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {tratamiento.servicio}
                        </p>

                        <p className="text-sm text-gray-500">
                          {formatearMoneda(
                            tratamiento.precioServicio
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Odontólogo
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {tratamiento.odontologo}
                        </p>

                        <p className="text-sm text-gray-500">
                          {tratamiento.especialidad ||
                            "Sin especialidad registrada"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Inicio
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatearFecha(
                            tratamiento.fechaInicio
                          )}
                        </p>

                        <p className="text-sm text-gray-500">
                          Fin:{" "}
                          {formatearFecha(
                            tratamiento.fechaFin
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Descripción
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {tratamiento.descripcion ||
                            "Sin descripción registrada"}
                        </p>
                      </div>
                    </div>

                    {tratamiento.observaciones && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Observaciones
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {tratamiento.observaciones}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 xl:w-40">
                    <Link
                      to={`/tratamientos/${tratamiento.idTratamiento}`}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      Ver detalle
                    </Link>

                    <Link
                      to={`/tratamientos/${tratamiento.idTratamiento}/editar`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Editar
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        eliminarTratamiento(tratamiento)
                      }
                      disabled={
                        eliminandoId ===
                        tratamiento.idTratamiento
                      }
                      className="rounded-lg border border-red-300 px-4 py-2 text-center text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {eliminandoId ===
                      tratamiento.idTratamiento
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}