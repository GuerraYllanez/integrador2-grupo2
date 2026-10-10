import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { historiasApi } from "../../api/historiasApi";
import { pacientesApi } from "../../api/pacientesApi";

type Paciente = {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
};

export default function HistoriaFormulario() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    idPaciente: "",
    codigoHistoria: "",
    antecedentes: "",
    alergias: "",
    observaciones: "",
  });

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        setCargandoPacientes(true);
        setError("");

        const data = await pacientesApi.list();

        setPacientes(data as Paciente[]);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los pacientes."
        );
      } finally {
        setCargandoPacientes(false);
      }
    };

    cargarPacientes();
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

    if (!formulario.idPaciente) {
      setError("Debes seleccionar un paciente.");
      return;
    }

    if (!formulario.codigoHistoria.trim()) {
      setError("Debes ingresar el código de historia clínica.");
      return;
    }

    try {
      setGuardando(true);

      await historiasApi.create({
        idPaciente: Number(formulario.idPaciente),
        codigoHistoria: formulario.codigoHistoria.trim(),
        antecedentes: formulario.antecedentes.trim(),
        alergias: formulario.alergias.trim(),
        observaciones: formulario.observaciones.trim(),
      });

      navigate("/historias");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la historia clínica."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <Link
          to="/historias"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Volver a historias clínicas
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          Nueva historia clínica
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra la historia odontológica del paciente.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={guardar}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Paciente */}
          <div>
            <label
              htmlFor="idPaciente"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Paciente *
            </label>

            <select
              id="idPaciente"
              value={formulario.idPaciente}
              onChange={(e) =>
                cambiarCampo("idPaciente", e.target.value)
              }
              disabled={cargandoPacientes || guardando}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {cargandoPacientes
                  ? "Cargando pacientes..."
                  : "Seleccionar paciente"}
              </option>

              {pacientes.map((paciente) => (
                <option
                  key={paciente.idPaciente}
                  value={paciente.idPaciente}
                >
                  {paciente.nombres} {paciente.apellidos} -{" "}
                  {paciente.documento}
                </option>
              ))}
            </select>
          </div>

          {/* Código */}
          <div>
            <label
              htmlFor="codigoHistoria"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Código de historia *
            </label>

            <input
              id="codigoHistoria"
              type="text"
              value={formulario.codigoHistoria}
              onChange={(e) =>
                cambiarCampo("codigoHistoria", e.target.value)
              }
              placeholder="Ej. HC-0001"
              maxLength={50}
              disabled={guardando}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Antecedentes */}
          <div className="md:col-span-2">
            <label
              htmlFor="antecedentes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Antecedentes
            </label>

            <textarea
              id="antecedentes"
              value={formulario.antecedentes}
              onChange={(e) =>
                cambiarCampo("antecedentes", e.target.value)
              }
              placeholder="Registra los antecedentes relevantes del paciente..."
              rows={4}
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Alergias */}
          <div className="md:col-span-2">
            <label
              htmlFor="alergias"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Alergias
            </label>

            <textarea
              id="alergias"
              value={formulario.alergias}
              onChange={(e) =>
                cambiarCampo("alergias", e.target.value)
              }
              placeholder="Registra las alergias conocidas del paciente..."
              rows={3}
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              placeholder="Agrega observaciones adicionales..."
              rows={4}
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/historias"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={guardando || cargandoPacientes}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar historia"}
          </button>
        </div>
      </form>
    </div>
  );
}