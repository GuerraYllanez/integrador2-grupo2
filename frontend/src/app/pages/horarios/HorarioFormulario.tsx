import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import {
  horariosApi,
  type EstadoHorario,
  type HorarioRequest,
} from "../../api/horariosApi";

import { odontologosApi } from "../../api/odontologosApi";

type Registro = Record<string, unknown>;

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor);
}

function obtenerId(item: Registro): number {
  return Number(
    item.idOdontologo ??
      item.id ??
      0
  );
}

function nombreOdontologo(
  item: Registro
): string {
  const nombreCompleto =
    texto(item.nombreCompleto);

  if (nombreCompleto) {
    return nombreCompleto;
  }

  const nombres =
    texto(item.nombres);

  const apellidos =
    texto(item.apellidos);

  return (
    `${nombres} ${apellidos}`.trim() ||
    "Odontólogo sin nombre"
  );
}

const estados: EstadoHorario[] = [
  "DISPONIBLE",
  "OCUPADO",
  "BLOQUEADO",
];

const estadoLabels: Record<
  EstadoHorario,
  string
> = {
  DISPONIBLE: "Disponible",
  OCUPADO: "Ocupado",
  BLOQUEADO: "Bloqueado",
};

export default function HorarioFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const esEdicion = Boolean(id);

  const [odontologos, setOdontologos] =
    useState<Registro[]>([]);

  const [formulario, setFormulario] =
    useState<HorarioRequest>({
      idOdontologo: 0,
      fecha: "",
      horaInicio: "",
      horaFin: "",
      estado: "DISPONIBLE",
    });

  const [loading, setLoading] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const odontologosData =
          await odontologosApi.list();

        setOdontologos(
          odontologosData as Registro[]
        );

        if (id) {
          const horario =
            await horariosApi.get(id);

          setFormulario({
            idOdontologo:
              horario.idOdontologo,
            fecha: horario.fecha,
            horaInicio:
              horario.horaInicio.substring(
                0,
                5
              ),
            horaFin:
              horario.horaFin.substring(
                0,
                5
              ),
            estado: horario.estado,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los datos del horario."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const actualizarCampo = (
    campo: keyof HorarioRequest,
    valor:
      | string
      | number
      | EstadoHorario
      | undefined
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const guardar = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (
      !formulario.idOdontologo ||
      !formulario.fecha ||
      !formulario.horaInicio ||
      !formulario.horaFin
    ) {
      setError(
        "Debe completar odontólogo, fecha, hora de inicio y hora de fin."
      );
      return;
    }

    if (
      formulario.horaInicio >=
      formulario.horaFin
    ) {
      setError(
        "La hora de inicio debe ser menor que la hora de fin."
      );
      return;
    }

    try {
      setGuardando(true);

      const datos: HorarioRequest = {
        idOdontologo:
          formulario.idOdontologo,
        fecha: formulario.fecha,
        horaInicio:
          formulario.horaInicio,
        horaFin:
          formulario.horaFin,
        estado:
          formulario.estado,
      };

      if (esEdicion && id) {
        await horariosApi.update(
          id,
          datos
        );
      } else {
        await horariosApi.create(datos);
      }

      navigate("/horarios");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el horario."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {esEdicion
              ? "Editar horario"
              : "Nuevo horario"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Cargando información...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {esEdicion
            ? "Editar horario"
            : "Nuevo horario"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Registre la disponibilidad de un odontólogo.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form
        onSubmit={guardar}
        className="space-y-6 rounded-lg border bg-card p-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="odontologo"
              className="text-sm font-medium"
            >
              Odontólogo
            </label>

            <select
              id="odontologo"
              value={
                formulario.idOdontologo || ""
              }
              onChange={(event) =>
                actualizarCampo(
                  "idOdontologo",
                  event.target.value
                    ? Number(
                        event.target.value
                      )
                    : 0
                )
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">
                Seleccione un odontólogo
              </option>

              {odontologos.map(
                (odontologo) => {
                  const idOdontologo =
                    obtenerId(
                      odontologo
                    );

                  return (
                    <option
                      key={idOdontologo}
                      value={
                        idOdontologo
                      }
                    >
                      {nombreOdontologo(
                        odontologo
                      )}
                    </option>
                  );
                }
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="fecha"
              className="text-sm font-medium"
            >
              Fecha
            </label>

            <input
              id="fecha"
              type="date"
              value={formulario.fecha}
              onChange={(event) =>
                actualizarCampo(
                  "fecha",
                  event.target.value
                )
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="estado"
              className="text-sm font-medium"
            >
              Estado
            </label>

            <select
              id="estado"
              value={
                formulario.estado ??
                "DISPONIBLE"
              }
              onChange={(event) =>
                actualizarCampo(
                  "estado",
                  event.target
                    .value as EstadoHorario
                )
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {estados.map(
                (estado) => (
                  <option
                    key={estado}
                    value={estado}
                  >
                    {
                      estadoLabels[
                        estado
                      ]
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="horaInicio"
              className="text-sm font-medium"
            >
              Hora de inicio
            </label>

            <input
              id="horaInicio"
              type="time"
              value={
                formulario.horaInicio
              }
              onChange={(event) =>
                actualizarCampo(
                  "horaInicio",
                  event.target.value
                )
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="horaFin"
              className="text-sm font-medium"
            >
              Hora de fin
            </label>

            <input
              id="horaFin"
              type="time"
              value={
                formulario.horaFin
              }
              onChange={(event) =>
                actualizarCampo(
                  "horaFin",
                  event.target.value
                )
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Link
            to="/horarios"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : esEdicion
                ? "Guardar cambios"
                : "Registrar horario"}
          </button>
        </div>
      </form>
    </div>
  );
}