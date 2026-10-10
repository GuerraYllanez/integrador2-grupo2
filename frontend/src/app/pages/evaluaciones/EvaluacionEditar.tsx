import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Card } from "../../components/ui/card";
import { evaluacionesApi } from "../../api/evaluacionesApi";
import { historiasApi } from "../../api/historiasApi";
import { apiFetch } from "../../api/client";

type Historia = {
  idHistoria: number;
  codigoHistoria?: string;
  paciente?: {
    idPaciente?: number;
    nombres?: string;
    apellidos?: string;
  };
};

type Odontologo = {
  idOdontologo: number;
  nombres?: string;
  apellidos?: string;
  especialidad?: string;
};

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

export default function EvaluacionEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);

  const [idHistoria, setIdHistoria] = useState("");
  const [idOdontologo, setIdOdontologo] = useState("");
  const [fechaEvaluacion, setFechaEvaluacion] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const [evaluacionData, historiasData, odontologosData] =
          await Promise.all([
            evaluacionesApi.get(id),
            historiasApi.list(),
            apiFetch<unknown[]>("/api/odontologos"),
          ]);

        const evaluacionCargada = evaluacionData as Evaluacion;

        setEvaluacion(evaluacionCargada);
        setHistorias(historiasData as Historia[]);
        setOdontologos(odontologosData as Odontologo[]);

        setIdHistoria(
          evaluacionCargada.idHistoria
            ? String(evaluacionCargada.idHistoria)
            : ""
        );

        setIdOdontologo(
          evaluacionCargada.idOdontologo
            ? String(evaluacionCargada.idOdontologo)
            : ""
        );

        setFechaEvaluacion(
          evaluacionCargada.fechaEvaluacion || ""
        );

        setDiagnostico(
          evaluacionCargada.diagnostico || ""
        );

        setObservaciones(
          evaluacionCargada.observaciones || ""
        );

        setRecomendaciones(
          evaluacionCargada.recomendaciones || ""
        );
      } catch (err) {
        console.error("Error al cargar evaluación:", err);
        setError("No se pudo cargar la evaluación clínica.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const guardarCambios = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!id) return;

    if (!idHistoria || !idOdontologo || !fechaEvaluacion) {
      setError(
        "Historia clínica, odontólogo y fecha de evaluación son obligatorios."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await evaluacionesApi.update(id, {
        idHistoria: Number(idHistoria),
        idOdontologo: Number(idOdontologo),
        fechaEvaluacion,
        diagnostico,
        observaciones,
        recomendaciones,
      });

      navigate(`/evaluaciones/${id}`);
    } catch (err) {
      console.error("Error al actualizar evaluación:", err);
      setError("No se pudo actualizar la evaluación clínica.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-teal-700">
            ODAM · Módulo
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Editar evaluación clínica
          </h1>
        </div>

        <Card className="p-6">
          <p className="text-sm text-gray-500">
            Cargando evaluación...
          </p>
        </Card>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-teal-700">
            ODAM · Módulo
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Editar evaluación clínica
          </h1>
        </div>

        <Card className="p-6">
          <p className="text-sm text-red-600">
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
          <p className="text-sm font-medium text-teal-700">
            ODAM · Módulo
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Editar evaluación clínica
          </h1>

          <p className="mt-2 text-gray-500">
            Modifica la información de la evaluación odontológica.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/evaluaciones/${id}`)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Volver
        </button>
      </div>

      <Card className="p-6">
        <form onSubmit={guardarCambios} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Historia clínica */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Historia clínica
              </label>

              <select
                value={idHistoria}
                onChange={(e) => setIdHistoria(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              >
                <option value="">
                  Seleccionar historia clínica
                </option>

                {historias.map((historia) => (
                  <option
                    key={historia.idHistoria}
                    value={historia.idHistoria}
                  >
                    {historia.codigoHistoria ||
                      `HC-${historia.idHistoria}`}
                    {historia.paciente
                      ? ` - ${historia.paciente.nombres || ""} ${
                          historia.paciente.apellidos || ""
                        }`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Odontólogo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Odontólogo
              </label>

              <select
                value={idOdontologo}
                onChange={(e) => setIdOdontologo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              >
                <option value="">
                  Seleccionar odontólogo
                </option>

                {odontologos.map((odontologo) => (
                  <option
                    key={odontologo.idOdontologo}
                    value={odontologo.idOdontologo}
                  >
                    Dr. {odontologo.nombres || ""}{" "}
                    {odontologo.apellidos || ""}
                    {odontologo.especialidad
                      ? ` - ${odontologo.especialidad}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fecha de evaluación
              </label>

              <input
                type="date"
                value={fechaEvaluacion}
                onChange={(e) => setFechaEvaluacion(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Diagnóstico
            </label>

            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              rows={4}
              placeholder="Ingrese el diagnóstico clínico..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Observaciones
            </label>

            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={4}
              placeholder="Ingrese las observaciones clínicas..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Recomendaciones */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Recomendaciones
            </label>

            <textarea
              value={recomendaciones}
              onChange={(e) => setRecomendaciones(e.target.value)}
              rows={4}
              placeholder="Ingrese las recomendaciones..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/evaluaciones/${id}`)}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}