import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { historiasApi } from "../../api/historiasApi";

type Paciente = {
  idPaciente?: number;
  nombres?: string;
  apellidos?: string;
  documento?: string;
  telefono?: string;
  correo?: string;
};

type HistoriaClinicaData = {
  idHistoria?: number;
  codigoHistoria?: string;
  antecedentes?: string;
  alergias?: string;
  observaciones?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  paciente?: Paciente;
};

export default function HistoriaDetalle() {
  const { id } = useParams();

  const [historia, setHistoria] =
    useState<HistoriaClinicaData | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarHistoria = async () => {
      if (!id) {
        setError("No se indicó una historia clínica.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const data = await historiasApi.get(id);

        setHistoria(data as HistoriaClinicaData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la historia clínica."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarHistoria();
  }, [id]);

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "-";

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha;
    }

    return fechaObj.toLocaleString("es-PE");
  };

  if (cargando) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Cargando historia clínica...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/historias"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Volver a historias clínicas
        </Link>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">
            No se pudo cargar la historia clínica.
          </p>

          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!historia) {
    return (
      <div className="space-y-4">
        <Link
          to="/historias"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Volver a historias clínicas
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            No se encontró la historia clínica.
          </p>
        </div>
      </div>
    );
  }

  const paciente = historia.paciente;

  const nombrePaciente = paciente
    ? `${paciente.nombres ?? ""} ${
        paciente.apellidos ?? ""
      }`.trim()
    : "-";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/historias"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Volver a historias clínicas
          </Link>

          <h1 className="mt-3 text-2xl font-semibold text-gray-900">
            Detalle de historia clínica
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulta del historial clínico asociado a un paciente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {historia.codigoHistoria || "-"}
          </div>

          {historia.idHistoria && (
            <Link
              to={`/historias/${historia.idHistoria}/editar`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Editar
            </Link>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Información del paciente
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Paciente
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {nombrePaciente}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Documento
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {paciente?.documento || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Teléfono
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {paciente?.telefono || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Correo
            </p>
            <p className="mt-1 break-all text-sm text-gray-700">
              {paciente?.correo || "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Datos de la historia clínica
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              ID de historia
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {historia.idHistoria ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Código
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {historia.codigoHistoria || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Fecha de creación
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatearFecha(historia.fechaCreacion)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Última actualización
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatearFecha(historia.fechaActualizacion)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Antecedentes
        </h2>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {historia.antecedentes ||
              "No se registraron antecedentes."}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Alergias
        </h2>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {historia.alergias ||
              "No se registraron alergias."}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Observaciones
        </h2>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {historia.observaciones ||
              "No se registraron observaciones."}
          </p>
        </div>
      </section>
    </div>
  );
}