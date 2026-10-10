import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router";

import { marketingApi } from "../../api/marketingApi";

import "./MarketingDetalle.css";

function formatearFecha(
  fecha?: string | null
): string {
  if (!fecha) {
    return "—";
  }

  const partes = fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function MarketingDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [registro, setRegistro] =
    useState<Awaited<
      ReturnType<typeof marketingApi.get>
    > | null>(null);

  useEffect(() => {
    if (!id) {
      setError(
        "No se recibió el identificador del registro."
      );

      setCargando(false);

      return;
    }

    cargarRegistro(id);
  }, [id]);

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

      setRegistro(data);
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

  if (cargando) {
    return (
      <div className="marketing-detail-page">
        <div className="marketing-detail-card">
          Cargando registro...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketing-detail-page">
        <div className="marketing-detail-card">

          <div className="marketing-detail-error">
            {error}
          </div>

          <button
            type="button"
            className="marketing-detail-btn marketing-detail-btn-secondary"
            onClick={() =>
              navigate("/marketing")
            }
          >
            Volver a Marketing
          </button>

        </div>
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="marketing-detail-page">
        <div className="marketing-detail-card">
          No se encontró el registro.
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-detail-page">

      <div className="marketing-detail-header">

        <div>
          <h1>
            Detalle de campaña
          </h1>

          <p>
            Información del registro de marketing.
          </p>
        </div>

        <div className="marketing-detail-header-actions">

          <button
            type="button"
            className="marketing-detail-btn marketing-detail-btn-secondary"
            onClick={() =>
              navigate("/marketing")
            }
          >
            Volver
          </button>

          <button
            type="button"
            className="marketing-detail-btn marketing-detail-btn-primary"
            onClick={() =>
              navigate(
                `/marketing/${registro.idMarketing}/editar`
              )
            }
          >
            Editar
          </button>

        </div>

      </div>

      <div className="marketing-detail-card">

        <div className="marketing-detail-title">
          <span>
            #{registro.idMarketing}
          </span>

          <h2>
            {registro.nombreCampana}
          </h2>

          <span
            className={
              registro.estado
                ? "marketing-detail-status marketing-detail-status-active"
                : "marketing-detail-status marketing-detail-status-inactive"
            }
          >
            {registro.estado
              ? "Activo"
              : "Inactivo"}
          </span>
        </div>

        <div className="marketing-detail-grid">

          <div className="marketing-detail-item marketing-detail-item-full">
            <span>
              Descripción
            </span>

            <strong>
              {registro.descripcion?.trim()
                || "Sin descripción"}
            </strong>
          </div>

          <div className="marketing-detail-item">
            <span>
              Fecha de inicio
            </span>

            <strong>
              {formatearFecha(
                registro.fechaInicio
              )}
            </strong>
          </div>

          <div className="marketing-detail-item">
            <span>
              Fecha de fin
            </span>

            <strong>
              {formatearFecha(
                registro.fechaFin
              )}
            </strong>
          </div>

          <div className="marketing-detail-item">
            <span>
              ID de usuario
            </span>

            <strong>
              {registro.idUsuario ?? "—"}
            </strong>
          </div>

          <div className="marketing-detail-item">
            <span>
              Fecha de creación
            </span>

            <strong>
              {registro.fechaCreacion
                ? new Date(
                    registro.fechaCreacion
                  ).toLocaleString("es-PE")
                : "—"}
            </strong>
          </div>

        </div>

      </div>
    </div>
  );
}