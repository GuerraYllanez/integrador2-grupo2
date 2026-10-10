import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  horariosApi,
  type EstadoHorario,
  type HorarioResponse,
} from "../../api/horariosApi";

const estadoLabels: Record<EstadoHorario, string> = {
  DISPONIBLE: "Disponible",
  OCUPADO: "Ocupado",
  BLOQUEADO: "Bloqueado",
};

const estadoClasses: Record<EstadoHorario, string> = {
  DISPONIBLE:
    "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  OCUPADO:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  BLOQUEADO:
    "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/20",
};

export default function Horarios() {
  const [horarios, setHorarios] = useState<HorarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await horariosApi.list();
      setHorarios(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los horarios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, []);

  const eliminarHorario = async (id: number) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar este horario? Esta acción no se puede deshacer."
    );

    if (!confirmar) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await horariosApi.delete(id);

      setHorarios((actuales) =>
        actuales.filter((horario) => horario.idHorario !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el horario."
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

  const disponibles = horarios.filter(
    (horario) => horario.estado === "DISPONIBLE"
  ).length;

  const ocupados = horarios.filter(
    (horario) => horario.estado === "OCUPADO"
  ).length;

  const bloqueados = horarios.filter(
    (horario) => horario.estado === "BLOQUEADO"
  ).length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-primary" />

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Horarios
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Disponibilidad de odontólogos y bloques horarios.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/horarios/nuevo"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Nuevo horario
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
              Total de bloques
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {horarios.length}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Horarios registrados
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Disponibles
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {disponibles}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Bloques disponibles para citas
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Ocupados
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {ocupados}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Bloques actualmente ocupados
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Bloqueados
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {bloqueados}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Bloques no disponibles
            </p>
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              Bloques horarios
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Horarios registrados para los odontólogos.
            </p>
          </div>

          {!loading && (
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {horarios.length}{" "}
              {horarios.length === 1
                ? "horario registrado"
                : "horarios registrados"}
            </div>
          )}
        </div>

        {loading ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">
              Cargando horarios...
            </p>
          </div>
        ) : horarios.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto max-w-md">
              <h3 className="text-base font-semibold">
                No hay horarios registrados
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Actualmente no existen bloques horarios en el
                sistema.
              </p>

              <Link
                to="/horarios/nuevo"
                className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Registrar nuevo horario
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Fecha
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Horario
                  </th>

                  <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                    Odontólogo
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
                {horarios.map((horario) => (
                  <tr
                    key={horario.idHorario}
                    className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {formatearFecha(horario.fecha)}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        Horario #{horario.idHorario}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-foreground">
                        {formatearHora(horario.horaInicio)} -{" "}
                        {formatearHora(horario.horaFin)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {horario.odontologo}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          estadoClasses[horario.estado]
                        }`}
                      >
                        {estadoLabels[horario.estado]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/horarios/${horario.idHorario}`}
                          className="inline-flex items-center rounded-md border px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          Ver
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarHorario(horario.idHorario)
                          }
                          disabled={
                            deletingId === horario.idHorario
                          }
                          className="inline-flex items-center rounded-md border border-destructive/30 px-3.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === horario.idHorario
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