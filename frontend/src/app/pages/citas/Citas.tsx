import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  citasApi,
  type CitaResponse,
  type EstadoCita,
} from "../../api/citasApi";

const estadoLabels: Record<EstadoCita, string> = {
  PROGRAMADA: "Programada",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
  REPROGRAMADA: "Reprogramada",
};

const estadoClasses: Record<EstadoCita, string> = {
  PROGRAMADA:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  ATENDIDA:
    "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  CANCELADA:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  REPROGRAMADA:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
};

export default function Citas() {
  const [citas, setCitas] = useState<CitaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await citasApi.list();
      setCitas(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las citas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const eliminarCita = async (id: number) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar esta cita? Esta acción no se puede deshacer."
    );

    if (!confirmar) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await citasApi.delete(id);

      setCitas((actuales) =>
        actuales.filter((cita) => cita.idCita !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la cita."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) {
      return "-";
    }

    const [year, month, day] = fecha.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatearHora = (hora: string) => {
    if (!hora) {
      return "-";
    }

    return hora.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-primary" />

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Gestión de citas odontológicas
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Consulta y seguimiento de las citas registradas en el
                sistema.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/citas/nueva"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Nueva cita
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Resumen */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total de citas
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {citas.length}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Registros en el sistema
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Programadas
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                citas.filter(
                  (cita) => cita.estado === "PROGRAMADA"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Citas pendientes de atención
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Atendidas
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                citas.filter(
                  (cita) => cita.estado === "ATENDIDA"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Citas completadas
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Reprogramadas
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                citas.filter(
                  (cita) => cita.estado === "REPROGRAMADA"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Citas con cambio de fecha
            </p>
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              Listado de citas
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Seleccione una cita para consultar toda su información.
            </p>
          </div>

          {!loading && (
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {citas.length}{" "}
              {citas.length === 1
                ? "cita registrada"
                : "citas registradas"}
            </div>
          )}
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Cargando citas...
            </p>
          </div>
        ) : citas.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto max-w-md">
              <h3 className="text-base font-semibold">
                No hay citas registradas
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Actualmente no existen citas en el sistema.
                Registre una nueva cita para comenzar.
              </p>

              <Link
                to="/citas/nueva"
                className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Registrar nueva cita
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Fecha
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Hora
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Paciente
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Odontólogo
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Servicio
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Estado
                  </th>

                  <th className="px-5 py-3.5 text-right font-medium text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {citas.map((cita) => (
                  <tr
                    key={cita.idCita}
                    className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                  >
                    {/* Fecha */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {formatearFecha(cita.fechaCita)}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Cita #{cita.idCita}
                      </div>
                    </td>

                    {/* Hora */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-foreground">
                        {formatearHora(cita.horaCita)}
                      </span>
                    </td>

                    {/* Paciente */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {cita.paciente}
                      </div>

                      {cita.documentoPaciente && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          DNI: {cita.documentoPaciente}
                        </div>
                      )}
                    </td>

                    {/* Odontólogo */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {cita.odontologo}
                      </div>

                      {cita.especialidad && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {cita.especialidad}
                        </div>
                      )}
                    </td>

                    {/* Servicio */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {cita.servicio}
                      </div>

                      {cita.precioServicio !== undefined &&
                        cita.precioServicio !== null && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            S/{" "}
                            {Number(cita.precioServicio).toFixed(2)}
                          </div>
                        )}
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          estadoClasses[cita.estado]
                        }`}
                      >
                        {estadoLabels[cita.estado]}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/citas/${cita.idCita}`}
                          className="inline-flex items-center rounded-md border px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          Ver
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarCita(cita.idCita)
                          }
                          disabled={
                            deletingId === cita.idCita
                          }
                          className="inline-flex items-center rounded-md border border-destructive/30 px-3.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === cita.idCita
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}