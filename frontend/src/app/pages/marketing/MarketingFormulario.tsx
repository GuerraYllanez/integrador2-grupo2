import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router";

import {
  marketingApi,
  MarketingRequest,
} from "../../api/marketingApi";

import "./MarketingFormulario.css";

export default function MarketingFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editando = Boolean(id);

  const [nombreCampana, setNombreCampana] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [fechaInicio, setFechaInicio] =
    useState("");

  const [fechaFin, setFechaFin] =
    useState("");

  const [estado, setEstado] =
    useState(true);

  const [cargando, setCargando] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!editando || !id) {
      return;
    }

    cargarRegistro(id);
  }, [editando, id]);

  async function cargarRegistro(
    registroId: string
  ) {
    try {
      setCargando(true);
      setError("");

      const data =
        await marketingApi.get(
          registroId
        );

      setNombreCampana(
        data.nombreCampana ?? ""
      );

      setDescripcion(
        data.descripcion ?? ""
      );

      setFechaInicio(
        data.fechaInicio ?? ""
      );

      setFechaFin(
        data.fechaFin ?? ""
      );

      setEstado(
        data.estado
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el registro."
      );
    } finally {
      setCargando(false);
    }
  }

  async function guardar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const nombre =
      nombreCampana.trim();

    if (!nombre) {
      setError(
        "El nombre de la campaña es obligatorio."
      );
      return;
    }

    if (nombre.length > 150) {
      setError(
        "El nombre de la campaña no puede superar los 150 caracteres."
      );
      return;
    }

    if (
      fechaInicio &&
      fechaFin &&
      fechaFin < fechaInicio
    ) {
      setError(
        "La fecha fin no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    const data: MarketingRequest = {
      nombreCampana: nombre,
      descripcion:
        descripcion.trim() || undefined,
      fechaInicio:
        fechaInicio || undefined,
      fechaFin:
        fechaFin || undefined,
      estado,
    };

    try {
      setGuardando(true);

      if (editando && id) {
        await marketingApi.update(
          id,
          data
        );
      } else {
        await marketingApi.create(
          data
        );
      }

      navigate("/marketing");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el registro."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="marketing-form-page">
        <div className="marketing-form-card">
          <div className="marketing-form-loading">
            Cargando registro...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-form-page">

      <div className="marketing-form-header">
        <div>
          <h1>
            {editando
              ? "Editar campaña"
              : "Nuevo registro de marketing"}
          </h1>

          <p>
            {editando
              ? "Actualiza la información de la campaña."
              : "Registra una nueva campaña de captación de pacientes."}
          </p>
        </div>
      </div>

      <form
        className="marketing-form-card"
        onSubmit={guardar}
      >

        {error && (
          <div className="marketing-form-alert">
            {error}
          </div>
        )}

        <div className="marketing-form-grid">

          <div className="marketing-form-field marketing-form-field-full">
            <label htmlFor="nombreCampana">
              Nombre de la campaña
            </label>

            <input
              id="nombreCampana"
              type="text"
              value={nombreCampana}
              onChange={(event) =>
                setNombreCampana(
                  event.target.value
                )
              }
              maxLength={150}
              placeholder="Ej. Campaña de prevención dental"
              required
            />
          </div>

          <div className="marketing-form-field marketing-form-field-full">
            <label htmlFor="descripcion">
              Descripción
            </label>

            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(event) =>
                setDescripcion(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Describe el objetivo de la campaña..."
            />
          </div>

          <div className="marketing-form-field">
            <label htmlFor="fechaInicio">
              Fecha de inicio
            </label>

            <input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(event) =>
                setFechaInicio(
                  event.target.value
                )
              }
            />
          </div>

          <div className="marketing-form-field">
            <label htmlFor="fechaFin">
              Fecha de fin
            </label>

            <input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(event) =>
                setFechaFin(
                  event.target.value
                )
              }
            />
          </div>

          <div className="marketing-form-field marketing-form-field-full">
            <label className="marketing-form-checkbox">
              <input
                type="checkbox"
                checked={estado}
                onChange={(event) =>
                  setEstado(
                    event.target.checked
                  )
                }
              />

              <span>
                Campaña activa
              </span>
            </label>
          </div>

        </div>

        <div className="marketing-form-actions">

          <button
            type="button"
            className="marketing-form-btn marketing-form-btn-secondary"
            onClick={() =>
              navigate("/marketing")
            }
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="marketing-form-btn marketing-form-btn-primary"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : editando
                ? "Guardar cambios"
                : "Crear campaña"}
          </button>

        </div>

      </form>
    </div>
  );
}