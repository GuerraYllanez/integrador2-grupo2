import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router";

import {
  citasApi,
  CitaRequest,
  CitaResponse,
} from "../../api/citasApi";

import { pacientesApi } from "../../api/pacientesApi";

import {
  odontologosApi,
  Odontologo,
} from "../../api/odontologosApi";

import {
  serviciosApi,
  Servicio,
} from "../../api/serviciosApi";

import "./CitaFormulario.css";

type Registro = Record<string, unknown>;

type Paciente = Registro & {
  idPaciente?: number;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
};

type Formulario = {
  idPaciente: string;
  idOdontologo: string;
  idServicio: string;
  fechaCita: string;
  horaCita: string;
  motivo: string;
  estado: CitaRequest["estado"];
  observaciones: string;
};

function texto(valor: unknown): string {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor);
}

function capitalizarTexto(
  valor: string
): string {
  const textoLimpio = valor.trim();

  if (!textoLimpio) {
    return "";
  }

  return (
    textoLimpio.charAt(0).toUpperCase() +
    textoLimpio.slice(1)
  );
}

function nombrePaciente(
  item: Paciente
): string {
  const nombreCompleto =
    texto(item.nombreCompleto);

  if (nombreCompleto) {
    return capitalizarTexto(
      nombreCompleto
    );
  }

  const nombres =
    texto(item.nombres);

  const apellidos =
    texto(item.apellidos);

  return capitalizarTexto(
    `${nombres} ${apellidos}`.trim()
  );
}

function nombreOdontologo(
  item: Odontologo
): string {
  const nombres =
    texto(item.nombres);

  const apellidos =
    texto(item.apellidos);

  return capitalizarTexto(
    `${nombres} ${apellidos}`.trim()
  );
}

function nombreServicio(
  item: Servicio
): string {
  return capitalizarTexto(
    item.nombre
  );
}

function precioServicio(
  item: Servicio
): string {
  const precio = Number(
    item.precio
  );

  if (!Number.isFinite(precio)) {
    return "";
  }

  return `S/ ${precio.toFixed(2)}`;
}

export default function CitaFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicion = Boolean(id);

  const [
    pacientes,
    setPacientes,
  ] = useState<Paciente[]>([]);

  const [
    odontologos,
    setOdontologos,
  ] = useState<Odontologo[]>([]);

  const [
    servicios,
    setServicios,
  ] = useState<Servicio[]>([]);

  const [
    formulario,
    setFormulario,
  ] = useState<Formulario>({
    idPaciente: "",
    idOdontologo: "",
    idServicio: "",
    fechaCita: "",
    horaCita: "",
    motivo: "",
    estado: "PROGRAMADA",
    observaciones: "",
  });

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [
        pacientesData,
        odontologosData,
        serviciosData,
      ] = await Promise.all([
        pacientesApi.list(),
        odontologosApi.list(),
        serviciosApi.list(),
      ]);

      setPacientes(
        pacientesData as Paciente[]
      );

      setOdontologos(
        odontologosData
      );

      setServicios(
        serviciosData
      );

      if (id) {
        const cita: CitaResponse =
          await citasApi.get(id);

        setFormulario({
          idPaciente: String(
            cita.idPaciente ?? ""
          ),

          idOdontologo: String(
            cita.idOdontologo ?? ""
          ),

          idServicio: String(
            cita.idServicio ?? ""
          ),

          fechaCita:
            cita.fechaCita ?? "",

          horaCita:
            cita.horaCita
              ? cita.horaCita.substring(
                  0,
                  5
                )
              : "",

          motivo:
            cita.motivo ?? "",

          estado:
            cita.estado ??
            "PROGRAMADA",

          observaciones:
            cita.observaciones ??
            "",
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los datos."
      );
    } finally {
      setCargando(false);
    }
  }

  const pacientesOrdenados =
    useMemo(() => {
      return [...pacientes].sort(
        (a, b) =>
          nombrePaciente(a).localeCompare(
            nombrePaciente(b),
            "es",
            {
              sensitivity: "base",
            }
          )
      );
    }, [pacientes]);

  const odontologosOrdenados =
    useMemo(() => {
      return [...odontologos].sort(
        (a, b) =>
          nombreOdontologo(a).localeCompare(
            nombreOdontologo(b),
            "es",
            {
              sensitivity: "base",
            }
          )
      );
    }, [odontologos]);

  const serviciosOrdenados =
    useMemo(() => {
      return [...servicios].sort(
        (a, b) =>
          nombreServicio(a).localeCompare(
            nombreServicio(b),
            "es",
            {
              sensitivity: "base",
            }
          )
      );
    }, [servicios]);

  function cambiarCampo(
    campo: keyof Formulario,
    valor: string
  ) {
    setFormulario(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );
  }

  function validarFechaHora():
    string | null {
    if (!formulario.fechaCita) {
      return "La fecha de la cita es obligatoria.";
    }

    if (!formulario.horaCita) {
      return "La hora de la cita es obligatoria.";
    }

    const fecha = new Date(
      `${formulario.fechaCita}T${formulario.horaCita}:00`
    );

    if (
      Number.isNaN(
        fecha.getTime()
      )
    ) {
      return "La fecha u hora ingresada no es válida.";
    }

    const diaSemana =
      fecha.getDay();

    if (diaSemana === 0) {
      return "No se pueden registrar citas los domingos.";
    }

    const hora =
      fecha.getHours();

    const minutos =
      fecha.getMinutes();

    const minutosDelDia =
      hora * 60 + minutos;

    if (diaSemana === 1) {
      if (
        minutosDelDia <
          21 * 60 ||
        minutosDelDia >
          23 * 60 + 59
      ) {
        return "Los lunes el horario de atención es de 9:00 p. m. a 11:59 p. m.";
      }
    } else {
      if (
        minutosDelDia <
          9 * 60 ||
        minutosDelDia >
          19 * 60
      ) {
        return "El horario de atención es de 9:00 a. m. a 7:00 p. m.";
      }
    }

    return null;
  }

  async function guardar(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!formulario.idPaciente) {
      setError(
        "Debes seleccionar un paciente."
      );
      return;
    }

    if (!formulario.idOdontologo) {
      setError(
        "Debes seleccionar un odontólogo."
      );
      return;
    }

    if (!formulario.idServicio) {
      setError(
        "Debes seleccionar un servicio."
      );
      return;
    }

    const errorFechaHora =
      validarFechaHora();

    if (errorFechaHora) {
      setError(
        errorFechaHora
      );
      return;
    }

    try {
      setGuardando(true);

      const datos: CitaRequest = {
        idPaciente: Number(
          formulario.idPaciente
        ),

        idOdontologo: Number(
          formulario.idOdontologo
        ),

        idServicio: Number(
          formulario.idServicio
        ),

        fechaCita:
          formulario.fechaCita,

        horaCita:
          formulario.horaCita
            .length === 5
            ? `${formulario.horaCita}:00`
            : formulario.horaCita,

        motivo:
          formulario.motivo.trim() ||
          undefined,

        estado:
          formulario.estado ||
          "PROGRAMADA",

        observaciones:
          formulario.observaciones.trim() ||
          undefined,
      };

      if (
        modoEdicion &&
        id
      ) {
        await citasApi.update(
          id,
          datos
        );
      } else {
        await citasApi.create(
          datos
        );
      }

      navigate("/citas");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la cita."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="cita-form-page">
        <div className="cita-form-card">
          <p className="cita-form-loading">
            Cargando información...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cita-form-page">

      <div className="cita-form-header">
        <div>
          <h1>
            {modoEdicion
              ? "Editar cita"
              : "Nueva cita"}
          </h1>

          <p>
            {modoEdicion
              ? "Actualiza la información de la cita."
              : "Registra una nueva cita odontológica."}
          </p>
        </div>
      </div>

      <div className="cita-form-card">

        {error && (
          <div className="cita-form-alert cita-form-alert-error">
            {error}
          </div>
        )}

        <form onSubmit={guardar}>

          <div className="cita-form-grid">

            <div className="cita-form-group">
              <label htmlFor="idPaciente">
                Paciente
              </label>

              <select
                id="idPaciente"
                value={
                  formulario.idPaciente
                }
                onChange={(event) =>
                  cambiarCampo(
                    "idPaciente",
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Seleccione un paciente
                </option>

                {pacientesOrdenados.map(
                  (paciente) => (
                    <option
                      key={
                        paciente.idPaciente
                      }
                      value={
                        paciente.idPaciente
                      }
                    >
                      {nombrePaciente(
                        paciente
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="cita-form-group">
              <label htmlFor="idOdontologo">
                Odontólogo
              </label>

              <select
                id="idOdontologo"
                value={
                  formulario.idOdontologo
                }
                onChange={(event) =>
                  cambiarCampo(
                    "idOdontologo",
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Seleccione un odontólogo
                </option>

                {odontologosOrdenados.map(
                  (odontologo) => {

                    const especialidad =
                      capitalizarTexto(
                        texto(
                          odontologo.especialidad
                        )
                      );

                    return (
                      <option
                        key={
                          odontologo.idOdontologo
                        }
                        value={
                          odontologo.idOdontologo
                        }
                      >
                        {nombreOdontologo(
                          odontologo
                        )}

                        {especialidad
                          ? ` - ${especialidad}`
                          : ""}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div className="cita-form-group">
              <label htmlFor="idServicio">
                Servicio
              </label>

              <select
                id="idServicio"
                value={
                  formulario.idServicio
                }
                onChange={(event) =>
                  cambiarCampo(
                    "idServicio",
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Seleccione un servicio
                </option>

                {serviciosOrdenados.map(
                  (servicio) => (
                    <option
                      key={
                        servicio.idServicio
                      }
                      value={
                        servicio.idServicio
                      }
                    >
                      {nombreServicio(
                        servicio
                      )}
                      {" - "}
                      {precioServicio(
                        servicio
                      )}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="cita-form-group">
              <label htmlFor="fechaCita">
                Fecha
              </label>

              <input
                id="fechaCita"
                type="date"
                value={
                  formulario.fechaCita
                }
                onChange={(event) =>
                  cambiarCampo(
                    "fechaCita",
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="cita-form-group">
              <label htmlFor="horaCita">
                Hora
              </label>

              <input
                id="horaCita"
                type="time"
                value={
                  formulario.horaCita
                }
                onChange={(event) =>
                  cambiarCampo(
                    "horaCita",
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="cita-form-group">
              <label htmlFor="estado">
                Estado
              </label>

              <select
                id="estado"
                value={
                  formulario.estado ??
                  "PROGRAMADA"
                }
                onChange={(event) =>
                  cambiarCampo(
                    "estado",
                    event.target.value
                  )
                }
              >
                <option value="PROGRAMADA">
                  Programada
                </option>

                <option value="ATENDIDA">
                  Atendida
                </option>

                <option value="CANCELADA">
                  Cancelada
                </option>

                <option value="REPROGRAMADA">
                  Reprogramada
                </option>
              </select>
            </div>

            <div className="cita-form-group cita-form-group-full">
              <label htmlFor="motivo">
                Motivo
              </label>

              <input
                id="motivo"
                type="text"
                value={
                  formulario.motivo
                }
                onChange={(event) =>
                  cambiarCampo(
                    "motivo",
                    event.target.value
                  )
                }
                placeholder="Motivo de la cita"
              />
            </div>

            <div className="cita-form-group cita-form-group-full">
              <label htmlFor="observaciones">
                Observaciones
              </label>

              <textarea
                id="observaciones"
                value={
                  formulario.observaciones
                }
                onChange={(event) =>
                  cambiarCampo(
                    "observaciones",
                    event.target.value
                  )
                }
                placeholder="Observaciones adicionales"
                rows={4}
              />
            </div>

          </div>

          <div className="cita-form-actions">

            <button
              type="button"
              className="cita-form-btn cita-form-btn-secondary"
              onClick={() =>
                navigate("/citas")
              }
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="cita-form-btn cita-form-btn-primary"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : modoEdicion
                ? "Actualizar cita"
                : "Guardar cita"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}