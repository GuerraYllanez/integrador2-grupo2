import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
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

export default function CitaDetalle() {
  const { id } = useParams();

  const [cita, setCita] = useState<CitaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarCita = async () => {
      if (!id) {
        setError("No se proporcionó el identificador de la cita.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await citasApi.get(id);
        setCita(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el detalle de la cita."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarCita();
  }, [id]);

  const formatearFecha = (fecha?: string) => {
    if (!fecha) {
      return "-";
    }

    const [year, month, day] = fecha.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatearHora = (hora?: string) => {
    if (!hora) {
      return "-";
    }

    return hora.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted-foreground">
        Cargando detalle de la cita...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>

        <Link
          to="/citas"
          className="inline-flex rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Volver a citas
        </Link>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm">
          No se encontró la cita solicitada.
        </div>

        <Link
          to="/citas"
          className="inline-flex rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Volver a citas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Detalle de la cita
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Información completa de la cita odontológica registrada.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/citas"
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Volver
          </Link>

          <Link
            to={`/citas/${cita.idCita}/editar`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Editar cita
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            Información de la cita #{cita.idCita}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Datos registrados para la programación odontológica.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fecha
            </p>

            <p className="mt-1 font-medium">
              {formatearFecha(cita.fechaCita)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hora
            </p>

            <p className="mt-1 font-medium">
              {formatearHora(cita.horaCita)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Paciente
            </p>

            <p className="mt-1 font-medium">
              {cita.paciente}
            </p>

            {cita.documentoPaciente && (
              <p className="mt-1 text-sm text-muted-foreground">
                DNI: {cita.documentoPaciente}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Odontólogo
            </p>

            <p className="mt-1 font-medium">
              {cita.odontologo}
            </p>

            {cita.especialidad && (
              <p className="mt-1 text-sm text-muted-foreground">
                {cita.especialidad}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Servicio
            </p>

            <p className="mt-1 font-medium">
              {cita.servicio}
            </p>

            {cita.precioServicio !== undefined &&
              cita.precioServicio !== null && (
                <p className="mt-1 text-sm text-muted-foreground">
                  S/ {Number(cita.precioServicio).toFixed(2)}
                </p>
              )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estado
            </p>

            <div className="mt-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {estadoLabels[cita.estado]}
              </span>
            </div>
          </div>

          {cita.personal && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Personal administrativo
              </p>

              <p className="mt-1 font-medium">
                {cita.personal}
              </p>
            </div>
          )}

          {cita.idHorario && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Horario asignado
              </p>

              <p className="mt-1 font-medium">
                #{cita.idHorario}
              </p>
            </div>
          )}

          {cita.motivo && (
            <div className="md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Motivo de la cita
              </p>

              <p className="mt-1">
                {cita.motivo}
              </p>
            </div>
          )}

          {cita.observaciones && (
            <div className="md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Observaciones
              </p>

              <p className="mt-1 whitespace-pre-wrap">
                {cita.observaciones}
              </p>
            </div>
          )}

          {cita.fechaRegistro && (
            <div className="md:col-span-2 border-t pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fecha de registro
              </p>

              <p className="mt-1 text-sm">
                {cita.fechaRegistro}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          to="/citas"
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Volver a citas
        </Link>

        <Link
          to={`/citas/${cita.idCita}/editar`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Editar cita
        </Link>
      </div>
    </div>
  );
}