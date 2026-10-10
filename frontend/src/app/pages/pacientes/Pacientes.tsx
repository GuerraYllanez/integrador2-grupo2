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

export default function Pacientes() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] =
    useState<number | null>(null);

  useEffect(() => {
    cargarPacientes();
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

  async function desactivarPaciente(
    paciente: Paciente
  ) {
    const confirmar = window.confirm(
      `¿Está seguro de desactivar al paciente ${paciente.nombres} ${paciente.apellidos}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoId(paciente.idPaciente);
      setError("");

      await apiFetch(
        `/api/pacientes/${paciente.idPaciente}`,
        {
          method: "DELETE",
        }
      );

      setPacientes((actuales) =>
        actuales.map((item) =>
          item.idPaciente === paciente.idPaciente
            ? { ...item, estado: false }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo desactivar el paciente."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function activarPaciente(
    paciente: Paciente
  ) {
    const confirmar = window.confirm(
      `¿Está seguro de activar nuevamente al paciente ${paciente.nombres} ${paciente.apellidos}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoId(paciente.idPaciente);
      setError("");

      await apiFetch(
        `/api/pacientes/${paciente.idPaciente}/activar`,
        {
          method: "PUT",
        }
      );

      setPacientes((actuales) =>
        actuales.map((item) =>
          item.idPaciente === paciente.idPaciente
            ? { ...item, estado: true }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo activar el paciente."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function eliminarPaciente(
    paciente: Paciente
  ) {
    const confirmar = window.confirm(
      `Esta acción eliminará definitivamente al paciente ${paciente.nombres} ${paciente.apellidos} de la base de datos. ¿Desea continuar?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoId(paciente.idPaciente);
      setError("");

      await apiFetch(
        `/api/pacientes/${paciente.idPaciente}/eliminar`,
        {
          method: "DELETE",
        }
      );

      setPacientes((actuales) =>
        actuales.filter(
          (item) =>
            item.idPaciente !== paciente.idPaciente
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el paciente."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="space-y-6 p-6">

      {/* ======================================================
          ENCABEZADO
      ====================================================== */}

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
          onClick={() =>
            navigate("/pacientes/nuevo")
          }
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Nuevo paciente
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          TABLA
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pacientes registrados
              </h2>

              <p className="text-sm text-gray-500">
                Consulta y administra la información de los pacientes.
              </p>
            </div>

            {!cargando && (
              <span className="text-sm text-gray-500">
                {pacientes.length}{" "}
                {pacientes.length === 1
                  ? "paciente"
                  : "pacientes"}
              </span>
            )}
          </div>
        </div>

        {cargando ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              Cargando pacientes...
            </p>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              No hay pacientes registrados.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/pacientes/nuevo")
              }
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Registrar paciente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full text-left">

              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Paciente
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Documento
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Teléfono
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Correo
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Sexo
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {pacientes.map((paciente) => {

                  const procesando =
                    procesandoId ===
                    paciente.idPaciente;

                  return (
                    <tr
                      key={paciente.idPaciente}
                      className="transition hover:bg-gray-50"
                    >

                      {/* ID */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          #{paciente.idPaciente}
                        </span>
                      </td>

                      {/* PACIENTE */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {paciente.nombres}
                          </p>

                          <p className="text-sm text-gray-500">
                            {paciente.apellidos}
                          </p>
                        </div>
                      </td>

                      {/* DOCUMENTO */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {paciente.documento}
                      </td>

                      {/* TELÉFONO */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {paciente.telefono || "-"}
                      </td>

                      {/* CORREO */}

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {paciente.correo || "-"}
                      </td>

                      {/* SEXO */}

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {paciente.sexo || "-"}
                      </td>

                      {/* ESTADO */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={
                            paciente.estado
                              ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                              : "inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {paciente.estado
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      {/* ACCIONES */}

                      <td className="px-5 py-4">
                        <div className="flex min-w-[410px] items-center justify-center gap-2">

                          {/* VER */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/pacientes/${paciente.idPaciente}`
                              )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Ver detalle
                          </button>

                          {/* EDITAR */}

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

                          {/* ACTIVAR / DESACTIVAR */}

                          {paciente.estado ? (
                            <button
                              type="button"
                              onClick={() =>
                                desactivarPaciente(
                                  paciente
                                )
                              }
                              disabled={procesando}
                              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {procesando
                                ? "Procesando..."
                                : "Desactivar"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                activarPaciente(
                                  paciente
                                )
                              }
                              disabled={procesando}
                              className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {procesando
                                ? "Procesando..."
                                : "Activar"}
                            </button>
                          )}

                          {/* ELIMINAR */}

                          <button
                            type="button"
                            onClick={() =>
                              eliminarPaciente(
                                paciente
                              )
                            }
                            disabled={procesando}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {procesando
                              ? "Procesando..."
                              : "Eliminar"}
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