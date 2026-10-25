import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { pacientesApi } from "../../api/pacientesApi";
import { apiFetch } from "../../api/client";

type Paciente = {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  sexo?: string;
  estado?: boolean;
  fechaRegistro?: string;
};

type FiltroEstado = "ACTIVOS" | "INACTIVOS" | "TODOS";

export default function Pacientes() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>("ACTIVOS");

  useEffect(() => {
    void cargarPacientes();
  }, []);

  async function cargarPacientes() {
    try {
      setCargando(true);
      setError("");

      const data = await pacientesApi.list();
      setPacientes(data as Paciente[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los pacientes."
      );
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstadoPaciente(
    paciente: Paciente,
    activar: boolean
  ) {
    const accion = activar ? "activar" : "desactivar";
    const nombreCompleto =
      `${paciente.nombres} ${paciente.apellidos}`;

    const confirmar = window.confirm(
      `¿Está seguro de ${accion} al paciente ${nombreCompleto}?`
    );

    if (!confirmar) return;

    try {
      setProcesandoId(paciente.idPaciente);
      setError("");
      setMensaje("");

      await apiFetch(
        activar
          ? `/api/pacientes/${paciente.idPaciente}/activar`
          : `/api/pacientes/${paciente.idPaciente}`,
        {
          method: activar ? "PUT" : "DELETE",
        }
      );

      setPacientes((actuales) =>
        actuales.map((item) =>
          item.idPaciente === paciente.idPaciente
            ? { ...item, estado: activar }
            : item
        )
      );

      setMensaje(
        `Paciente ${nombreCompleto} ${activar ? "activado" : "desactivado"
        } correctamente.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `No se pudo ${accion} al paciente.`
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function eliminarPacienteFisicamente(paciente: Paciente) {
    const nombreCompleto =
      `${paciente.nombres} ${paciente.apellidos}`;

    const confirmar = window.confirm(
      `¿Desea eliminar PERMANENTEMENTE al paciente ${nombreCompleto} (ID: ${paciente.idPaciente})?\n\n` +
      "Esta acción es irreversible. El sistema solo permitirá eliminarlo si no tiene registros relacionados.\n\n" +
      "Presione Aceptar para continuar."
    );

    if (!confirmar) return;

    try {
      setProcesandoId(paciente.idPaciente);
      setError("");
      setMensaje("");

      await apiFetch(
        `/api/pacientes/${paciente.idPaciente}/eliminar`,
        {
          method: "DELETE",
        }
      );

      setPacientes((actuales) =>
        actuales.filter(
          (item) => item.idPaciente !== paciente.idPaciente
        )
      );

      setMensaje(
        `El paciente ${nombreCompleto} fue eliminado correctamente.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar al paciente. Puede tener citas, historias clínicas u otros registros relacionados."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  const pacientesFiltrados = pacientes.filter((paciente) => {
    if (filtroEstado === "ACTIVOS") {
      return paciente.estado === true;
    }

    if (filtroEstado === "INACTIVOS") {
      return paciente.estado === false;
    }

    return true;
  });

  const cantidadActivos = pacientes.filter(
    (paciente) => paciente.estado === true
  ).length;

  const cantidadInactivos = pacientes.filter(
    (paciente) => paciente.estado === false
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* ENCABEZADO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Pacientes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Registro, búsqueda, consulta y actualización de pacientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pacientes/nuevo")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Nuevo paciente
        </button>
      </div>

      {/* MENSAJE DE ÉXITO */}
      {mensaje && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-sm font-medium text-green-700">
            {mensaje}
          </p>

          <button
            type="button"
            onClick={() => setMensaje("")}
            className="mt-2 text-sm font-semibold text-green-700 underline"
          >
            Cerrar mensaje
          </button>
        </div>
      )}

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void cargarPacientes()}
            className="mt-2 text-sm font-semibold text-red-700 underline"
          >
            Volver a intentar
          </button>
        </div>
      )}

      {/* RESUMEN */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total de pacientes</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {pacientes.length}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pacientes activos</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {cantidadActivos}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pacientes inactivos</p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {cantidadInactivos}
          </p>
        </div>
      </div>

      {/* TABLA DE PACIENTES */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pacientes registrados
              </h2>

              <p className="text-sm text-gray-500">
                Desactivar conserva el historial clínico. La eliminación física
                solo se permite cuando no existen registros relacionados.
              </p>
            </div>

            {/* FILTROS */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltroEstado("ACTIVOS")}
                aria-pressed={filtroEstado === "ACTIVOS"}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${filtroEstado === "ACTIVOS"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Activos ({cantidadActivos})
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado("INACTIVOS")}
                aria-pressed={filtroEstado === "INACTIVOS"}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${filtroEstado === "INACTIVOS"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Inactivos ({cantidadInactivos})
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado("TODOS")}
                aria-pressed={filtroEstado === "TODOS"}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${filtroEstado === "TODOS"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Todos ({pacientes.length})
              </button>
            </div>
          </div>

          {!cargando && (
            <p className="mt-3 text-sm text-gray-500">
              Mostrando {pacientesFiltrados.length}{" "}
              {pacientesFiltrados.length === 1
                ? "paciente"
                : "pacientes"}
            </p>
          )}
        </div>

        {cargando ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              Cargando pacientes...
            </p>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              {filtroEstado === "ACTIVOS"
                ? "No hay pacientes activos."
                : filtroEstado === "INACTIVOS"
                  ? "No hay pacientes inactivos."
                  : "No hay pacientes registrados."}
            </p>

            {filtroEstado === "ACTIVOS" && (
              <button
                type="button"
                onClick={() => navigate("/pacientes/nuevo")}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Registrar paciente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Paciente
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Documento
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Teléfono
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Correo
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Sexo
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pacientesFiltrados.map((paciente) => {
                  const procesando =
                    procesandoId === paciente.idPaciente;

                  return (
                    <tr
                      key={paciente.idPaciente}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          #{paciente.idPaciente}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {paciente.nombres}
                        </p>
                        <p className="text-sm text-gray-500">
                          {paciente.apellidos}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {paciente.documento || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {paciente.telefono || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {paciente.correo || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {paciente.sexo || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={
                            paciente.estado === true
                              ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                              : "inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {paciente.estado === true
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/pacientes/${paciente.idPaciente}`)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Ver detalle
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/pacientes/${paciente.idPaciente}/editar`
                              )
                            }
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Editar
                          </button>

                          {paciente.estado === true ? (
                            <button
                              type="button"
                              onClick={() =>
                                void cambiarEstadoPaciente(paciente, false)
                              }
                              disabled={procesando}
                              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {procesando ? "Procesando..." : "Desactivar"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                void cambiarEstadoPaciente(paciente, true)
                              }
                              disabled={procesando}
                              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {procesando ? "Procesando..." : "Activar"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              void eliminarPacienteFisicamente(paciente)
                            }
                            disabled={procesando}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {procesando ? "Procesando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}