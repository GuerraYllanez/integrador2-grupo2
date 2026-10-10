import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import {
  odontologosApi,
  Odontologo,
} from "../../api/odontologosApi";

import "./Odontologos.css";

export default function Odontologos() {
  const navigate = useNavigate();

  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarOdontologos();
  }, []);

  async function cargarOdontologos() {
    try {
      setCargando(true);
      setError("");

      const data = await odontologosApi.list();
      setOdontologos(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los odontólogos."
      );
    } finally {
      setCargando(false);
    }
  }

  async function eliminarOdontologo(id: number) {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar este odontólogo?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await odontologosApi.delete(id);

      setOdontologos((actuales) =>
        actuales.filter(
          (odontologo) => odontologo.idOdontologo !== id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el odontólogo."
      );
    }
  }

  const odontologosOrdenados = useMemo(() => {
    return [...odontologos].sort((a, b) => {
      const nombreA = `${a.apellidos} ${a.nombres}`;
      const nombreB = `${b.apellidos} ${b.nombres}`;

      return nombreA.localeCompare(nombreB, "es", {
        sensitivity: "base",
      });
    });
  }, [odontologos]);

  return (
    <div className="odontologos-page">
      <div className="odontologos-header">
        <div>
          <div className="odontologos-breadcrumb">
            Gestión / Profesionales
          </div>

          <h1>Odontólogos</h1>

          <p>
            Administración de profesionales, especialidades y
            colegiaturas.
          </p>
        </div>

        <button
          type="button"
          className="odontologos-btn odontologos-btn-primary"
          onClick={() => navigate("/odontologos/nuevo")}
        >
          <span className="odontologos-btn-icon">+</span>
          Nuevo odontólogo
        </button>
      </div>

      {error && (
        <div className="odontologos-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="odontologos-summary">
        <div className="odontologos-summary-card">
          <div className="odontologos-summary-label">
            Total de profesionales
          </div>

          <div className="odontologos-summary-value">
            {odontologos.length}
          </div>
        </div>

        <div className="odontologos-summary-card">
          <div className="odontologos-summary-label">
            Profesionales activos
          </div>

          <div className="odontologos-summary-value">
            {odontologos.filter((item) => item.estado).length}
          </div>
        </div>

        <div className="odontologos-summary-card">
          <div className="odontologos-summary-label">
            Especialidades
          </div>

          <div className="odontologos-summary-value">
            {
              new Set(
                odontologos
                  .map((item) => item.especialidad)
                  .filter(Boolean)
              ).size
            }
          </div>
        </div>
      </div>

      <section className="odontologos-card">
        <div className="odontologos-card-header">
          <div>
            <h2>Directorio de odontólogos</h2>

            <p>
              Consulta y administra los profesionales registrados.
            </p>
          </div>

          <button
            type="button"
            className="odontologos-btn odontologos-btn-light"
            onClick={cargarOdontologos}
          >
            Actualizar
          </button>
        </div>

        {cargando ? (
          <div className="odontologos-loading">
            <div className="odontologos-spinner" />
            <span>Cargando odontólogos...</span>
          </div>
        ) : odontologosOrdenados.length === 0 ? (
          <div className="odontologos-empty">
            <h3>No hay odontólogos registrados</h3>

            <p>
              Registra el primer profesional para comenzar.
            </p>

            <button
              type="button"
              className="odontologos-btn odontologos-btn-primary"
              onClick={() => navigate("/odontologos/nuevo")}
            >
              Nuevo odontólogo
            </button>
          </div>
        ) : (
          <div className="odontologos-table-wrapper">
            <table className="odontologos-table">
              <thead>
                <tr>
                  <th>PROFESIONAL</th>
                  <th>ESPECIALIDAD</th>
                  <th>COLEGIATURA</th>
                  <th>CONTACTO</th>
                  <th>ESTADO</th>
                  <th className="odontologos-actions-header">
                    ACCIONES
                  </th>
                </tr>
              </thead>

              <tbody>
                {odontologosOrdenados.map((odontologo) => (
                  <tr key={odontologo.idOdontologo}>
                    <td>
                      <div className="odontologos-profesional">
                        <div className="odontologos-avatar">
                          {odontologo.nombres
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {odontologo.nombres}{" "}
                            {odontologo.apellidos}
                          </strong>

                          <span>
                            ID #{odontologo.idOdontologo}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="odontologos-specialty">
                        {odontologo.especialidad ||
                          "Sin especialidad"}
                      </span>
                    </td>

                    <td>
                      <span className="odontologos-license">
                        {odontologo.colegiatura}
                      </span>
                    </td>

                    <td>
                      <div className="odontologos-contact">
                        <span>
                          {odontologo.telefono ||
                            "Sin teléfono"}
                        </span>

                        <span>
                          {odontologo.correo ||
                            "Sin correo"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          odontologo.estado
                            ? "odontologos-status odontologos-status-active"
                            : "odontologos-status odontologos-status-inactive"
                        }
                      >
                        <span className="odontologos-status-dot" />

                        {odontologo.estado
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <div className="odontologos-actions">
                        <button
                          type="button"
                          className="odontologos-action odontologos-action-view"
                          onClick={() =>
                            navigate(
                              `/odontologos/${odontologo.idOdontologo}`
                            )
                          }
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          className="odontologos-action odontologos-action-edit"
                          onClick={() =>
                            navigate(
                              `/odontologos/${odontologo.idOdontologo}/editar`
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="odontologos-action odontologos-action-delete"
                          onClick={() =>
                            eliminarOdontologo(
                              odontologo.idOdontologo
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}