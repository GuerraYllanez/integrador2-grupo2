import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { apiFetch } from "../../api/client";
import { evaluacionesApi } from "../../api/evaluacionesApi";
import { historiasApi } from "../../api/historiasApi";

type HistoriaClinica = {
  idHistoria: number;
  codigoHistoria: string;
  paciente?: {
    nombres?: string;
    apellidos?: string;
    documento?: string;
  };
};

type Odontologo = {
  idOdontologo: number;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  colegiatura?: string;
};

export default function EvaluacionFormulario() {
  const navigate = useNavigate();

  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    idHistoria: "",
    idOdontologo: "",
    fechaEvaluacion: new Date().toLocaleDateString("en-CA"),
    diagnostico: "",
    observaciones: "",
    recomendaciones: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [historiasData, odontologosData] = await Promise.all([
          historiasApi.list(),
          apiFetch<unknown[]>("/api/odontologos"),
        ]);

        setHistorias(historiasData as HistoriaClinica[]);
        setOdontologos(odontologosData as Odontologo[]);
      } catch (err) {
        console.error("Error al cargar datos:", err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los datos necesarios."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const cambiarCampo = (
    campo: keyof typeof formulario,
    valor: string
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!formulario.idHistoria) {
      setError("Debes seleccionar una historia clínica.");
      return;
    }

    if (!formulario.idOdontologo) {
      setError("Debes seleccionar un odontólogo.");
      return;
    }

    if (!formulario.fechaEvaluacion) {
      setError("Debes ingresar la fecha de evaluación.");
      return;
    }

    try {
      setGuardando(true);

      await evaluacionesApi.create({
        idHistoria: Number(formulario.idHistoria),
        idOdontologo: Number(formulario.idOdontologo),
        fechaEvaluacion: formulario.fechaEvaluacion,
        diagnostico: formulario.diagnostico.trim(),
        observaciones: formulario.observaciones.trim(),
        recomendaciones: formulario.recomendaciones.trim(),
      });

      navigate("/evaluaciones");
    } catch (err) {
      console.error("Error al registrar evaluación:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la evaluación clínica."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Cargando historias clínicas y odontólogos...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/evaluaciones"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Volver a evaluaciones
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          Nueva evaluación clínica
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra la evaluación odontológica del paciente.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">
            No se pudo registrar la evaluación.
          </p>

          <p className="mt-1 break-words">{error}</p>
        </div>
      )}

      <form
        onSubmit={guardar}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Historia clínica */}
          <div>
            <label
              htmlFor="idHistoria"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Historia clínica *
            </label>

            <select
              id="idHistoria"
              value={formulario.idHistoria}
              onChange={(e) =>
                cambiarCampo("idHistoria", e.target.value)
              }
              disabled={guardando}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Seleccionar historia</option>

              {historias.map((historia) => (
                <option
                  key={historia.idHistoria}
                  value={historia.idHistoria}
                >
                  {historia.codigoHistoria} -{" "}
                  {historia.paciente
                    ? `${historia.paciente.nombres ?? ""} ${
                        historia.paciente.apellidos ?? ""
                      }`.trim()
                    : "Paciente"}
                </option>
              ))}
            </select>

            {historias.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                No hay historias clínicas disponibles.
              </p>
            )}
          </div>

          {/* Odontólogo */}
          <div>
            <label
              htmlFor="idOdontologo"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Odontólogo *
            </label>

            <select
              id="idOdontologo"
              value={formulario.idOdontologo}
              onChange={(e) =>
                cambiarCampo("idOdontologo", e.target.value)
              }
              disabled={guardando}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Seleccionar odontólogo</option>

              {odontologos.map((odontologo) => (
                <option
                  key={odontologo.idOdontologo}
                  value={odontologo.idOdontologo}
                >
                  Dr. {odontologo.nombres} {odontologo.apellidos}
                  {odontologo.especialidad
                    ? ` - ${odontologo.especialidad}`
                    : ""}
                </option>
              ))}
            </select>

            {odontologos.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                No hay odontólogos disponibles.
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label
              htmlFor="fechaEvaluacion"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Fecha de evaluación *
            </label>

            <input
              id="fechaEvaluacion"
              type="date"
              value={formulario.fechaEvaluacion}
              onChange={(e) =>
                cambiarCampo("fechaEvaluacion", e.target.value)
              }
              disabled={guardando}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Diagnóstico */}
          <div className="md:col-span-2">
            <label
              htmlFor="diagnostico"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Diagnóstico
            </label>

            <textarea
              id="diagnostico"
              value={formulario.diagnostico}
              onChange={(e) =>
                cambiarCampo("diagnostico", e.target.value)
              }
              rows={4}
              placeholder="Ingresa el diagnóstico clínico..."
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label
              htmlFor="observaciones"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Observaciones
            </label>

            <textarea
              id="observaciones"
              value={formulario.observaciones}
              onChange={(e) =>
                cambiarCampo("observaciones", e.target.value)
              }
              rows={4}
              placeholder="Registra las observaciones de la evaluación..."
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Recomendaciones */}
          <div className="md:col-span-2">
            <label
              htmlFor="recomendaciones"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Recomendaciones
            </label>

            <textarea
              id="recomendaciones"
              value={formulario.recomendaciones}
              onChange={(e) =>
                cambiarCampo("recomendaciones", e.target.value)
              }
              rows={4}
              placeholder="Ingresa las recomendaciones para el paciente..."
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/evaluaciones"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar evaluación"}
          </button>
        </div>
      </form>
    </div>
  );
}