import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
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

export default function HorarioDetalle() {
  const { id } = useParams();

  const [horario, setHorario] = useState<HorarioResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarHorario = async () => {
      if (!id) {
        setError("No se indicó el horario.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await horariosApi.get(id);
        setHorario(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el horario."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarHorario();
  }, [id]);

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

  if (loading) {
    return (
      <div className="px-6 py-14 text-center">
        <p className="text-sm text-muted-foreground">
          Cargando información del horario...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <Link
          to="/horarios"
          className="inline-flex rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Volver a horarios
        </Link>

        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!horario) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-primary" />

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Detalle del horario
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Información del bloque horario seleccionado.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/horarios"
            className="inline-flex items-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Volver a horarios
          </Link>

          <Link
            to={`/horarios/${horario.idHorario}/editar`}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Editar horario
          </Link>
        </div>
      </div>

      {/* Información principal */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-base font-semibold">
            Información del bloque
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Datos registrados para este horario.
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              #{horario.idHorario}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Odontólogo
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {horario.odontologo}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estado
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  estadoClasses[horario.estado]
                }`}
              >
                {estadoLabels[horario.estado]}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fecha
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatearFecha(horario.fecha)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hora de inicio
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatearHora(horario.horaInicio)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hora de fin
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatearHora(horario.horaFin)}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen visual */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">
          Resumen del bloque
        </h2>

        <div className="mt-4 rounded-lg bg-muted/40 p-5">
          <p className="text-sm text-muted-foreground">
            El odontólogo
          </p>

          <p className="mt-1 text-base font-semibold text-foreground">
            {horario.odontologo}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            tiene registrado un bloque horario para el{" "}
            <span className="font-medium text-foreground">
              {formatearFecha(horario.fecha)}
            </span>{" "}
            desde{" "}
            <span className="font-medium text-foreground">
              {formatearHora(horario.horaInicio)}
            </span>{" "}
            hasta{" "}
            <span className="font-medium text-foreground">
              {formatearHora(horario.horaFin)}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}