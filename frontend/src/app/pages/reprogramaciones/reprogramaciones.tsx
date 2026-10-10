import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  reprogramacionesApi,
  type ReprogramacionResponse,
} from "../../api/reprogramacionesApi";

export default function Reprogramaciones() {

  const navigate = useNavigate();

  const [
    reprogramaciones,
    setReprogramaciones
  ] = useState<ReprogramacionResponse[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarReprogramaciones();
  }, []);

  async function cargarReprogramaciones() {

    try {

      setCargando(true);
      setError("");

      const data =
        await reprogramacionesApi.list();

      setReprogramaciones(data);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las reprogramaciones."
      );

    } finally {

      setCargando(false);
    }
  }

  async function eliminar(id: number) {

    const confirmar =
      window.confirm(
        "¿Estás seguro de eliminar esta reprogramación?"
      );

    if (!confirmar) {
      return;
    }

    try {

      setError("");

      await reprogramacionesApi.delete(id);

      await cargarReprogramaciones();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la reprogramación."
      );
    }
  }

  if (cargando) {

    return (
      <div
        style={{
          padding: "32px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Cargando reprogramaciones...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px",
        backgroundColor: "#f8fafc",
        minHeight: "100%",
        fontFamily: "Arial, sans-serif",
      }}
    >

      {/* ========================================================
          ENCABEZADO
      ======================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Reprogramaciones
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: "#6b7280",
            }}
          >
            Gestión de solicitudes y cambios de citas.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/reprogramaciones/nueva")
          }
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "11px 18px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Nueva reprogramación
        </button>

      </div>


      {/* ========================================================
          MENSAJE DE ERROR
      ======================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}


      {/* ========================================================
          CONTENEDOR DE LA TABLA
      ======================================================== */}

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
        }}
      >

        {/* CABECERA DE LA TARJETA */}

        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >

          <h2
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Registro de reprogramaciones
          </h2>

          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            Reprogramaciones registradas en el sistema.
          </p>

        </div>


        {reprogramaciones.length === 0 ? (

          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            No hay reprogramaciones registradas.
          </div>

        ) : (

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                minWidth: "1100px",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >

              <thead>

                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                  }}
                >

                  <th style={estiloEncabezado}>
                    ID
                  </th>

                  <th style={estiloEncabezado}>
                    Cita
                  </th>

                  <th style={estiloEncabezado}>
                    Paciente
                  </th>

                  <th style={estiloEncabezado}>
                    Odontólogo
                  </th>

                  <th style={estiloEncabezado}>
                    Fecha anterior
                  </th>

                  <th style={estiloEncabezado}>
                    Nueva fecha
                  </th>

                  <th
                    style={{
                      ...estiloEncabezado,
                      minWidth: "240px",
                    }}
                  >
                    Motivo
                  </th>

                  <th
                    style={{
                      ...estiloEncabezado,
                      minWidth: "190px",
                      textAlign: "center",
                    }}
                  >
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {reprogramaciones.map(
                  (reprogramacion) => (

                    <tr
                      key={
                        reprogramacion.idReprogramacion
                      }
                      style={{
                        borderTop:
                          "1px solid #e5e7eb",
                      }}
                    >

                      <td style={estiloCelda}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          #{reprogramacion.idReprogramacion}
                        </span>
                      </td>


                      <td style={estiloCelda}>
                        #{reprogramacion.idCita}
                      </td>


                      <td style={estiloCelda}>
                        Paciente #{reprogramacion.idPaciente}
                      </td>


                      <td style={estiloCelda}>
                        Odontólogo #{reprogramacion.idOdontologo}
                      </td>


                      <td
                        style={{
                          ...estiloCelda,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 500,
                            color: "#374151",
                          }}
                        >
                          {formatearFecha(
                            reprogramacion.fechaAnterior
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          {formatearHora(
                            reprogramacion.horaAnterior
                          )}
                        </div>
                      </td>


                      <td
                        style={{
                          ...estiloCelda,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#2563eb",
                          }}
                        >
                          {formatearFecha(
                            reprogramacion.nuevaFecha
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          {formatearHora(
                            reprogramacion.nuevaHora
                          )}
                        </div>
                      </td>


                      <td style={estiloCelda}>

                        <span
                          style={{
                            color: "#4b5563",
                            lineHeight: 1.5,
                          }}
                        >
                          {reprogramacion.motivo || "Sin motivo"}
                        </span>

                      </td>


                      <td
                        style={{
                          ...estiloCelda,
                          textAlign: "center",
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "7px",
                            flexWrap: "wrap",
                          }}
                        >

                          {/* VER */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/reprogramaciones/${reprogramacion.idReprogramacion}`
                              )
                            }
                            style={estiloBotonVer}
                          >
                            Ver
                          </button>


                          {/* EDITAR */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/reprogramaciones/${reprogramacion.idReprogramacion}/editar`
                              )
                            }
                            style={estiloBotonEditar}
                          >
                            Editar
                          </button>


                          {/* ELIMINAR */}

                          <button
                            type="button"
                            onClick={() =>
                              eliminar(
                                reprogramacion.idReprogramacion
                              )
                            }
                            style={estiloBotonEliminar}
                          >
                            Eliminar
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


/* ============================================================
   ESTILOS
============================================================ */

const estiloEncabezado: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const estiloCelda: React.CSSProperties = {
  padding: "16px",
  verticalAlign: "middle",
  color: "#374151",
  borderBottom: "1px solid #f1f5f9",
};

const estiloBotonVer: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  padding: "7px 11px",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const estiloBotonEditar: React.CSSProperties = {
  border: "1px solid #93c5fd",
  borderRadius: "6px",
  padding: "7px 11px",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const estiloBotonEliminar: React.CSSProperties = {
  border: "1px solid #fecaca",
  borderRadius: "6px",
  padding: "7px 11px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};


/* ============================================================
   FORMATO DE FECHAS Y HORAS
============================================================ */

function formatearFecha(
  fecha: string
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


function formatearHora(
  hora: string
): string {

  if (!hora) {
    return "—";
  }

  return hora.substring(0, 5);
}