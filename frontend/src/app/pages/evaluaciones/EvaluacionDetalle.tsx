import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card } from "../../components/ui/card";
import { evaluacionesApi } from "../../api/evaluacionesApi";

type Evaluacion = {
  idEvaluacion: number;
  idHistoria?: number;
  codigoHistoria?: string;
  paciente?: string;
  idOdontologo?: number;
  odontologo?: string;
  especialidad?: string;
  fechaEvaluacion: string;
  diagnostico?: string;
  observaciones?: string;
  recomendaciones?: string;
};

export default function EvaluacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const cargarEvaluacion = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await evaluacionesApi.get(id);
        setEvaluacion(data as Evaluacion);
      } catch (err) {
        console.error("Error al cargar evaluación:", err);
        setError("No se pudo cargar la evaluación clínica.");
      } finally {
        setCargando(false);
      }
    };

    cargarEvaluacion();
  }, [id]);

  if (cargando) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-teal-700">ODAM · Módulo</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Detalle de evaluación clínica
          </h1>
        </div>

        <Card className="p-6">
          <p className="text-gray-500">Cargando evaluación...</p>
        </Card>
      </div>
    );
  }

  if (error || !evaluacion) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-teal-700">ODAM · Módulo</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Detalle de evaluación clínica
          </h1>
        </div>

        <Card className="p-6">
          <p className="text-red-600">
            {error || "Evaluación no encontrada."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/evaluaciones")}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Volver a evaluaciones
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">ODAM · Módulo</p>

          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Evaluación clínica
          </h1>

          <p className="text-gray-500 mt-2">
            Información detallada de la evaluación odontológica.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/evaluaciones")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Volver
        </button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Paciente</p>
            <p className="mt-1 font-semibold text-gray-900">
              {evaluacion.paciente || "No registrado"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Historia clínica</p>
            <p className="mt-1 font-semibold text-gray-900">
              {evaluacion.codigoHistoria || "No registrada"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Odontólogo</p>
            <p className="mt-1 font-semibold text-gray-900">
              {evaluacion.odontologo || "No registrado"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Especialidad</p>
            <p className="mt-1 font-semibold text-gray-900">
              {evaluacion.especialidad || "No registrada"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Fecha de evaluación</p>
            <p className="mt-1 font-semibold text-gray-900">
              {evaluacion.fechaEvaluacion}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">ID de evaluación</p>
            <p className="mt-1 font-semibold text-gray-900">
              #{evaluacion.idEvaluacion}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Diagnóstico
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-gray-700">
          {evaluacion.diagnostico || "Sin diagnóstico registrado."}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Observaciones
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-gray-700">
          {evaluacion.observaciones || "Sin observaciones registradas."}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recomendaciones
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-gray-700">
          {evaluacion.recomendaciones || "Sin recomendaciones registradas."}
        </p>
      </Card>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/evaluaciones")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </button>

        <button
          type="button"
          onClick={() => navigate(`/evaluaciones/${evaluacion.idEvaluacion}/editar`)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Editar evaluación
        </button>
      </div>
    </div>
  );
}