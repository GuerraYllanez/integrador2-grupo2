import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  odontologosApi,
  Odontologo,
} from "../../api/odontologosApi";

import "./OdontologoDetalle.css";

export default function OdontologoDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [odontologo, setOdontologo] =
    useState<Odontologo | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No se encontró el odontólogo.");
      setCargando(false);
      return;
    }

    cargarOdontologo(id);
  }, [id]);

  async function cargarOdontologo(odontologoId: string) {
    try {
      setCargando(true);
      setError("");

      const datos =
        await odontologosApi.get(odontologoId);

      setOdontologo(datos);
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

  if (cargando) {
    return (
      <div className="odontologo-detail-page">
        <div className="odontologo-detail-loading">
          Cargando información del profesional...
        </div>
      </div>
    );
  }

  if (error || !odontologo) {
    return (
      <div className="odontologo-detail-page">
        <div className="odontologo-detail-error">
          <h2>No se pudo cargar la información</h2>

          <p>
            {error || "Odontólogo no encontrado."}
          </p>

          <button
            type="button"
            className="odontologo-detail-btn odontologo-detail-btn-secondary"
            onClick={() => navigate("/odontologos")}
          >
            Volver a odontólogos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="odontologo-detail-page">
      <div className="odontologo-detail-header">
        <div>
          <div className="odontologo-detail-breadcrumb">
            Gestión / Profesionales / Detalle
          </div>

          <h1>
            {odontologo.nombres}{" "}
            {odontologo.apellidos}
          </h1>

          <p>
            Información del profesional odontológico.
          </p>
        </div>

        <div className="odontologo-detail-header-actions">
          <button
            type="button"
            className="odontologo-detail-btn odontologo-detail-btn-secondary"
            onClick={() => navigate("/odontologos")}
          >
            Volver
          </button>

          <button
            type="button"
            className="odontologo-detail-btn odontologo-detail-btn-primary"
            onClick={() =>
              navigate(
                `/odontologos/${odontologo.idOdontologo}/editar`
              )
            }
          >
            Editar odontólogo
          </button>
        </div>
      </div>

      <div className="odontologo-profile-card">
        <div className="odontologo-profile-top">
          <div className="odontologo-profile-avatar">
            {odontologo.nombres
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2>
              {odontologo.nombres}{" "}
              {odontologo.apellidos}
            </h2>

            <p>
              {odontologo.especialidad ||
                "Sin especialidad registrada"}
            </p>

            <span
              className={
                odontologo.estado
                  ? "odontologo-detail-status active"
                  : "odontologo-detail-status inactive"
              }
            >
              <span />
              {odontologo.estado
                ? "Profesional activo"
                : "Profesional inactivo"}
            </span>
          </div>
        </div>
      </div>

      <section className="odontologo-information-card">
        <div className="odontologo-information-header">
          <div>
            <h2>Información profesional</h2>

            <p>
              Datos registrados del odontólogo.
            </p>
          </div>
        </div>

        <div className="odontologo-information-grid">
          <div className="odontologo-information-item">
            <span>Nombres</span>
            <strong>{odontologo.nombres}</strong>
          </div>

          <div className="odontologo-information-item">
            <span>Apellidos</span>
            <strong>{odontologo.apellidos}</strong>
          </div>

          <div className="odontologo-information-item">
            <span>Especialidad</span>
            <strong>
              {odontologo.especialidad ||
                "No registrada"}
            </strong>
          </div>

          <div className="odontologo-information-item">
            <span>Colegiatura</span>
            <strong>
              {odontologo.colegiatura}
            </strong>
          </div>

          <div className="odontologo-information-item">
            <span>Teléfono</span>
            <strong>
              {odontologo.telefono ||
                "No registrado"}
            </strong>
          </div>

          <div className="odontologo-information-item">
            <span>Correo electrónico</span>
            <strong>
              {odontologo.correo ||
                "No registrado"}
            </strong>
          </div>

          <div className="odontologo-information-item">
            <span>Estado</span>
            <strong>
              {odontologo.estado
                ? "Activo"
                : "Inactivo"}
            </strong>
          </div>

          <div className="odontologo-information-item">
            <span>ID del profesional</span>
            <strong>
              #{odontologo.idOdontologo}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}