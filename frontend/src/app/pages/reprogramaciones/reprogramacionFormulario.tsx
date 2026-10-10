import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router";

import {
  reprogramacionesApi,
} from "../../api/reprogramacionesApi";

import {
  citasApi,
  type CitaResponse,
} from "../../api/citasApi";

interface Formulario {
  idCita: string;
  nuevaFecha: string;
  nuevaHora: string;
  motivo: string;
}

function formatearFecha(
  fecha: string | null | undefined
) {
  if (!fecha) {
    return "-";
  }

  const partes = fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearHora(
  hora: string | null | undefined
) {
  if (!hora) {
    return "-";
  }

  return hora.length >= 5
    ? hora.substring(0, 5)
    : hora;
}

export default function ReprogramacionFormulario() {
  const navigate = useNavigate();

  const [citas, setCitas] =
    useState<CitaResponse[]>([]);

  const [formulario, setFormulario] =
    useState<Formulario>({
      idCita: "",
      nuevaFecha: "",
      nuevaHora: "",
      motivo: "",
    });

  const [cargandoCitas, setCargandoCitas] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState("");

  const [exito, setExito] = useState("");

  useEffect(() => {
    async function cargarCitas() {
      try {
        setCargandoCitas(true);
        setError("");

        const data = await citasApi.list();

        setCitas(data);
      } catch (err) {
        const mensaje =
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las citas.";

        setError(mensaje);
      } finally {
        setCargandoCitas(false);
      }
    }

    cargarCitas();
  }, []);

  const citaSeleccionada = citas.find(
    (cita) =>
      cita.idCita === Number(formulario.idCita)
  );

  function actualizarCampo(
    campo: keyof Formulario,
    valor: string
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setExito("");

    if (!formulario.idCita) {
      setError("Debes seleccionar una cita.");
      return;
    }

    if (!formulario.nuevaFecha) {
      setError("La nueva fecha es obligatoria.");
      return;
    }

    if (!formulario.nuevaHora) {
      setError("La nueva hora es obligatoria.");
      return;
    }

    if (!citaSeleccionada) {
      setError("La cita seleccionada no es válida.");
      return;
    }

    try {
      setGuardando(true);

      await reprogramacionesApi.create({
        idCita: Number(formulario.idCita),
        nuevaFecha: formulario.nuevaFecha,
        nuevaHora: formulario.nuevaHora,
        motivo:
          formulario.motivo.trim() || undefined,
      });

      setExito(
        "La cita fue reprogramada correctamente."
      );

      setTimeout(() => {
        navigate("/reprogramaciones");
      }, 700);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo registrar la reprogramación.";

      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Nueva reprogramación
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra el cambio de fecha y hora de una cita.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {exito && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {exito}
        </div>
      )}

      <form
        onSubmit={guardar}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div>
          <label
            htmlFor="idCita"
            className="block text-sm font-medium text-gray-700"
          >
            Cita
          </label>

          <select
            id="idCita"
            value={formulario.idCita}
            onChange={(event) =>
              actualizarCampo(
                "idCita",
                event.target.value
              )
            }
            disabled={
              cargandoCitas || guardando
            }
            className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          >
            <option value="">
              {cargandoCitas
                ? "Cargando citas..."
                : "Selecciona una cita"}
            </option>

            {citas.map((cita) => (
              <option
                key={cita.idCita}
                value={cita.idCita}
              >
                Cita #{cita.idCita} — Paciente #
                {cita.idPaciente} —{" "}
                {formatearFecha(cita.fechaCita)}{" "}
                {formatearHora(cita.horaCita)}
              </option>
            ))}
          </select>
        </div>

        {citaSeleccionada && (
          <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Paciente
              </p>

              <p className="mt-1 text-sm text-gray-900">
                #{citaSeleccionada.idPaciente}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Odontólogo
              </p>

              <p className="mt-1 text-sm text-gray-900">
                #{citaSeleccionada.idOdontologo}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Fecha actual
              </p>

              <p className="mt-1 text-sm text-gray-900">
                {formatearFecha(
                  citaSeleccionada.fechaCita
                )}{" "}
                {formatearHora(
                  citaSeleccionada.horaCita
                )}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nuevaFecha"
              className="block text-sm font-medium text-gray-700"
            >
              Nueva fecha
            </label>

            <input
              id="nuevaFecha"
              type="date"
              value={formulario.nuevaFecha}
              onChange={(event) =>
                actualizarCampo(
                  "nuevaFecha",
                  event.target.value
                )
              }
              disabled={guardando}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="nuevaHora"
              className="block text-sm font-medium text-gray-700"
            >
              Nueva hora
            </label>

            <input
              id="nuevaHora"
              type="time"
              value={formulario.nuevaHora}
              onChange={(event) =>
                actualizarCampo(
                  "nuevaHora",
                  event.target.value
                )
              }
              disabled={guardando}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="motivo"
            className="block text-sm font-medium text-gray-700"
          >
            Motivo
          </label>

          <textarea
            id="motivo"
            value={formulario.motivo}
            onChange={(event) =>
              actualizarCampo(
                "motivo",
                event.target.value
              )
            }
            disabled={guardando}
            rows={4}
            placeholder="Indica el motivo de la reprogramación."
            className="mt-2 block w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/reprogramaciones")
            }
            disabled={guardando}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              guardando || cargandoCitas
            }
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : "Guardar reprogramación"}
          </button>
        </div>
      </form>
    </div>
  );
}