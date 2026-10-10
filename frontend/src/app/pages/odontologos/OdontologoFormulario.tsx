import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  odontologosApi,
  OdontologoRequest,
} from "../../api/odontologosApi";

import "./OdontologoFormulario.css";

type Formulario = {
  nombres: string;
  apellidos: string;
  especialidad: string;
  colegiatura: string;
  telefono: string;
  correo: string;
  estado: boolean;
};

const formularioInicial: Formulario = {
  nombres: "",
  apellidos: "",
  especialidad: "",
  colegiatura: "",
  telefono: "",
  correo: "",
  estado: true,
};

export default function OdontologoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicion = Boolean(id);

  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [cargando, setCargando] =
    useState(modoEdicion);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }

    cargarOdontologo(id);
  }, [id]);

  async function cargarOdontologo(odontologoId: string) {
    try {
      setCargando(true);
      setError("");

      const odontologo =
        await odontologosApi.get(odontologoId);

      setFormulario({
        nombres: odontologo.nombres ?? "",
        apellidos: odontologo.apellidos ?? "",
        especialidad:
          odontologo.especialidad ?? "",
        colegiatura:
          odontologo.colegiatura ?? "",
        telefono:
          odontologo.telefono ?? "",
        correo:
          odontologo.correo ?? "",
        estado:
          odontologo.estado ?? true,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el odontólogo."
      );
    } finally {
      setCargando(false);
    }
  }

  function cambiarCampo(
    campo: keyof Formulario,
    valor: string | boolean
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

    if (guardando) {
      return;
    }

    setError("");

    if (!formulario.nombres.trim()) {
      setError("Los nombres son obligatorios.");
      return;
    }

    if (!formulario.apellidos.trim()) {
      setError("Los apellidos son obligatorios.");
      return;
    }

    if (!formulario.colegiatura.trim()) {
      setError(
        "La colegiatura es obligatoria."
      );
      return;
    }

    try {
      setGuardando(true);

      const datos: OdontologoRequest = {
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        especialidad:
          formulario.especialidad.trim(),
        colegiatura:
          formulario.colegiatura.trim(),
        telefono:
          formulario.telefono.trim(),
        correo:
          formulario.correo.trim(),
        estado: formulario.estado,
      };

      console.log(
        "Datos enviados al backend:",
        datos
      );

      if (modoEdicion && id) {
        await odontologosApi.update(
          id,
          datos
        );
      } else {
        await odontologosApi.create(
          datos
        );
      }

      navigate("/odontologos");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el odontólogo."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="odontologo-form-page">
        <div className="odontologo-form-loading">
          Cargando información...
        </div>
      </div>
    );
  }

  return (
    <div className="odontologo-form-page">
      <div className="odontologo-form-header">
        <div>
          <div className="odontologo-form-breadcrumb">
            Gestión / Profesionales /{" "}
            {modoEdicion
              ? "Editar"
              : "Nuevo"}
          </div>

          <h1>
            {modoEdicion
              ? "Editar odontólogo"
              : "Nuevo odontólogo"}
          </h1>

          <p>
            {modoEdicion
              ? "Actualiza los datos del profesional."
              : "Registra un nuevo profesional odontológico."}
          </p>
        </div>
      </div>

      {error && (
        <div className="odontologo-form-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form
        className="odontologo-form-card"
        onSubmit={guardar}
      >
        <div className="odontologo-form-section">
          <div className="odontologo-form-section-title">
            Información personal
          </div>

          <div className="odontologo-form-grid">
            <div className="odontologo-form-group">
              <label htmlFor="nombres">
                Nombres
              </label>

              <input
                id="nombres"
                type="text"
                value={formulario.nombres}
                onChange={(event) =>
                  cambiarCampo(
                    "nombres",
                    event.target.value
                  )
                }
                placeholder="Ej. María"
                required
              />
            </div>

            <div className="odontologo-form-group">
              <label htmlFor="apellidos">
                Apellidos
              </label>

              <input
                id="apellidos"
                type="text"
                value={formulario.apellidos}
                onChange={(event) =>
                  cambiarCampo(
                    "apellidos",
                    event.target.value
                  )
                }
                placeholder="Ej. García Torres"
                required
              />
            </div>
          </div>
        </div>

        <div className="odontologo-form-section">
          <div className="odontologo-form-section-title">
            Información profesional
          </div>

          <div className="odontologo-form-grid">
            <div className="odontologo-form-group">
              <label htmlFor="especialidad">
                Especialidad
              </label>

              <input
                id="especialidad"
                type="text"
                value={formulario.especialidad}
                onChange={(event) =>
                  cambiarCampo(
                    "especialidad",
                    event.target.value
                  )
                }
                placeholder="Ej. Ortodoncia"
              />
            </div>

            <div className="odontologo-form-group">
              <label htmlFor="colegiatura">
                Colegiatura
              </label>

              <input
                id="colegiatura"
                type="text"
                value={formulario.colegiatura}
                onChange={(event) =>
                  cambiarCampo(
                    "colegiatura",
                    event.target.value
                  )
                }
                placeholder="Ej. COP-10005"
                required
              />
            </div>

            <div className="odontologo-form-group">
              <label htmlFor="telefono">
                Teléfono
              </label>

              <input
                id="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={(event) =>
                  cambiarCampo(
                    "telefono",
                    event.target.value
                  )
                }
                placeholder="Ej. 987654321"
              />
            </div>

            <div className="odontologo-form-group">
              <label htmlFor="correo">
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                value={formulario.correo}
                onChange={(event) =>
                  cambiarCampo(
                    "correo",
                    event.target.value
                  )
                }
                placeholder="correo@odam.com"
              />
            </div>

            <div className="odontologo-form-group">
              <label htmlFor="estado">
                Estado
              </label>

              <select
                id="estado"
                value={
                  formulario.estado
                    ? "true"
                    : "false"
                }
                onChange={(event) =>
                  cambiarCampo(
                    "estado",
                    event.target.value ===
                      "true"
                  )
                }
              >
                <option value="true">
                  Activo
                </option>

                <option value="false">
                  Inactivo
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="odontologo-form-actions">
          <button
            type="button"
            className="odontologo-form-btn odontologo-form-btn-secondary"
            onClick={() =>
              navigate("/odontologos")
            }
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="odontologo-form-btn odontologo-form-btn-primary"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
              ? "Actualizar odontólogo"
              : "Guardar odontólogo"}
          </button>
        </div>
      </form>
    </div>
  );
}