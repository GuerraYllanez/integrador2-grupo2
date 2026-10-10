import { useEffect, useState } from "react";
import { Link } from "react-router";

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

export default function EvaluacionesClinicas() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState<number | null>(null);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await evaluacionesApi.list();

      setEvaluaciones(data as Evaluacion[]);
    } catch (err) {
      console.error("Error al cargar evaluaciones:", err);
      setError(
        "No se pudieron cargar las evaluaciones clínicas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const eliminarEvaluacion = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta evaluación clínica?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setEliminando(id);
      setError("");

      await evaluacionesApi.delete(id);

      setEvaluaciones((actuales) =>
        actuales.filter(
          (evaluacion) =>
            evaluacion.idEvaluacion !== id
        )
      );
    } catch (err) {
      console.error(
        "Error al eliminar evaluación:",
        err
      );

      setError(
        "No se pudo eliminar la evaluación clínica."
      );
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Evaluaciones clínicas
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Evaluaciones odontológicas, hallazgos y diagnóstico clínico.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Evaluaciones registradas
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Consulta, modifica o elimina las evaluaciones clínicas.
            </p>
          </div>

          <Link
            to="/evaluaciones/nueva"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            + Nueva evaluación
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">
              Cargando evaluaciones...
            </p>
          </div>
        ) : evaluaciones.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">
              No hay evaluaciones clínicas registradas.
            </p>

            <Link
              to="/evaluaciones/nueva"
              className="mt-4 inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Registrar evaluación
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Historia
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Paciente
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Odontólogo
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fecha
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Diagnóstico
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {evaluaciones.map((evaluacion) => (
                  <tr
                    key={evaluacion.idEvaluacion}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      #{evaluacion.idEvaluacion}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {evaluacion.codigoHistoria ||
                        `HC-${evaluacion.idHistoria}`}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {evaluacion.paciente ||
                        "Sin paciente"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {evaluacion.odontologo ||
                        "Sin odontólogo"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {evaluacion.fechaEvaluacion}
                    </td>

                    <td className="max-w-[250px] px-4 py-4 text-sm text-gray-700">
                      {evaluacion.diagnostico ||
                        "Sin diagnóstico"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/evaluaciones/${evaluacion.idEvaluacion}`}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Ver
                        </Link>

                        <Link
                          to={`/evaluaciones/${evaluacion.idEvaluacion}/editar`}
                          className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarEvaluacion(
                              evaluacion.idEvaluacion
                            )
                          }
                          disabled={
                            eliminando ===
                            evaluacion.idEvaluacion
                          }
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {eliminando ===
                          evaluacion.idEvaluacion
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
      </Card>
    </div>
  );
}