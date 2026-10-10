import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router";

import {
  marketingApi,
  Marketing as MarketingRegistro,
} from "../../api/marketingApi";

import "./Marketing.css";

function texto(valor: unknown): string {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor);
}

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

export default function Marketing() {
  const navigate = useNavigate();

  const [
    registros,
    setRegistros,
  ] = useState<MarketingRegistro[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    procesandoId,
    setProcesandoId,
  ] = useState<number | null>(null);

  useEffect(() => {
    cargarRegistros();
  }, []);

  async function cargarRegistros() {
    try {
      setCargando(true);
      setError("");

      const data =
        await marketingApi.list();

      setRegistros(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los registros de marketing."
      );
    } finally {
      setCargando(false);
    }
  }

  const registrosOrdenados =
    useMemo(() => {
      return [...registros].sort(
        (a, b) =>
          a.nombreCampana.localeCompare(
            b.nombreCampana,
            "es",
            {
              sensitivity: "base",
            }
          )
      );
    }, [registros]);

  const total = registros.length;

  const activos = registros.filter(
    (registro) =>
      registro.estado
  ).length;

  const inactivos =
    total - activos;

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async function desactivar(
    registro: MarketingRegistro
  ) {
    const confirmar =
      window.confirm(
        `¿Deseas desactivar la campaña "${registro.nombreCampana}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoId(
        registro.idMarketing
      );

      setError("");

      await marketingApi.deactivate(
        registro.idMarketing
      );

      await cargarRegistros();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo desactivar la campaña."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  // ============================================================
  // ELIMINAR DEFINITIVAMENTE
  // ============================================================

  async function eliminar(
    registro: MarketingRegistro
  ) {
    const confirmar =
      window.confirm(
        `¿Estás seguro de eliminar definitivamente la campaña "${registro.nombreCampana}"?\n\nEsta acción no se puede deshacer.`
      );

    if (!confirmar) {
      return;
    }

    try {
      setProcesandoId(
        registro.idMarketing
      );

      setError("");

      await marketingApi.delete(
        registro.idMarketing
      );

      await cargarRegistros();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la campaña."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="marketing-page">

      <div className="marketing-header">
        <div>
          <h1>Marketing</h1>

          <p>
            Gestión de campañas y registros
            de captación de pacientes.
          </p>
        </div>

        <button
          type="button"
          className="marketing-btn marketing-btn-primary"
          onClick={() =>
            navigate("/marketing/nuevo")
          }
        >
          Nuevo registro
        </button>
      </div>

      <div className="marketing-stats">

        <div className="marketing-stat-card">
          <span>Total</span>
          <strong>{total}</strong>
        </div>

        <div className="marketing-stat-card">
          <span>Activos</span>
          <strong>{activos}</strong>
        </div>

        <div className="marketing-stat-card">
          <span>Inactivos</span>
          <strong>{inactivos}</strong>
        </div>

      </div>

      {error && (
        <div className="marketing-alert">
          {error}
        </div>
      )}

      <div className="marketing-card">

        <div className="marketing-card-header">
          <div>
            <h2>
              Registros de marketing
            </h2>

            <p>
              Campañas registradas en el sistema.
            </p>
          </div>

          <button
            type="button"
            className="marketing-btn marketing-btn-secondary"
            onClick={cargarRegistros}
            disabled={cargando}
          >
            Actualizar
          </button>
        </div>

        {cargando ? (
          <div className="marketing-empty">
            Cargando registros...
          </div>
        ) : registrosOrdenados.length === 0 ? (
          <div className="marketing-empty">
            <strong>
              No hay registros de marketing.
            </strong>

            <span>
              Puedes crear la primera campaña
              desde el botón "Nuevo registro".
            </span>
          </div>
        ) : (
          <div className="marketing-table-wrapper">

            <table className="marketing-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Campaña</th>
                  <th>Descripción</th>
                  <th>Fecha inicio</th>
                  <th>Fecha fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {registrosOrdenados.map(
                  (registro) => (
                    <tr
                      key={
                        registro.idMarketing
                      }
                    >
                      <td>
                        #{registro.idMarketing}
                      </td>

                      <td>
                        <strong>
                          {registro.nombreCampana}
                        </strong>
                      </td>

                      <td>
                        {texto(
                          registro.descripcion
                        ) || "—"}
                      </td>

                      <td>
                        {formatearFecha(
                          registro.fechaInicio
                        )}
                      </td>

                      <td>
                        {formatearFecha(
                          registro.fechaFin
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            registro.estado
                              ? "marketing-status marketing-status-active"
                              : "marketing-status marketing-status-inactive"
                          }
                        >
                          {registro.estado
                            ? "Activo"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        <div className="marketing-actions">

                          {/* VER */}

                          <button
                            type="button"
                            className="marketing-action-btn"
                            onClick={() =>
                              navigate(
                                `/marketing/${registro.idMarketing}`
                              )
                            }
                          >
                            Ver
                          </button>

                          {/* EDITAR */}

                          <button
                            type="button"
                            className="marketing-action-btn"
                            onClick={() =>
                              navigate(
                                `/marketing/${registro.idMarketing}/editar`
                              )
                            }
                          >
                            Editar
                          </button>

                          {/* DESACTIVAR */}

                          {registro.estado && (
                            <button
                              type="button"
                              className="marketing-action-btn marketing-action-warning"
                              onClick={() =>
                                desactivar(
                                  registro
                                )
                              }
                              disabled={
                                procesandoId ===
                                registro.idMarketing
                              }
                            >
                              {procesandoId ===
                              registro.idMarketing
                                ? "Procesando..."
                                : "Desactivar"}
                            </button>
                          )}

                          {/* ELIMINAR */}

                          <button
                            type="button"
                            className="marketing-action-btn marketing-action-danger"
                            onClick={() =>
                              eliminar(
                                registro
                              )
                            }
                            disabled={
                              procesandoId ===
                              registro.idMarketing
                            }
                          >
                            {procesandoId ===
                            registro.idMarketing
                              ? "Procesando..."
                              : "Eliminar"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}