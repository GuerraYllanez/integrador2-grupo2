import { FormEvent, useEffect, useState } from "react";
import {
serviciosApi,
Servicio,
ServicioRequest,
} from "../../api/serviciosApi";

const formularioInicial: ServicioRequest = {
nombre: "",
descripcion: "",
precio: 0,
estado: true,
};

export default function Servicios() {
const [servicios, setServicios] = useState<Servicio[]>([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState("");
const [mensaje, setMensaje] = useState("");

const [mostrarFormulario, setMostrarFormulario] = useState(false);
const [mostrarInactivos, setMostrarInactivos] = useState(false);
const [editandoId, setEditandoId] = useState<number | null>(null);
const [guardando, setGuardando] = useState(false);
const [eliminandoId, setEliminandoId] = useState<number | null>(null);

const [formulario, setFormulario] =
useState<ServicioRequest>(formularioInicial);

// Carga los servicios registrados desde el backend.
const cargarServicios = async () => {
try {
setCargando(true);
setError("");

  const data = await serviciosApi.list();

  setServicios(
    Array.isArray(data)
      ? data.map((servicio) => ({
          ...servicio,
          estado:
            servicio.estado === true ||
            String(servicio.estado).toLowerCase() === "true" ||
            String(servicio.estado) === "1",
          precio: Number(servicio.precio),
        }))
      : []
  );
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "No se pudieron cargar los servicios."
  );
} finally {
  setCargando(false);
}

};

useEffect(() => {
void cargarServicios();
}, []);

// Por defecto, muestra únicamente los servicios activos.
const serviciosVisibles = mostrarInactivos
? servicios
: servicios.filter((servicio) => servicio.estado);

const abrirNuevo = () => {
setEditandoId(null);
setFormulario({ ...formularioInicial });
setMensaje("");
setError("");
setMostrarFormulario(true);
};

const abrirEditar = (servicio: Servicio) => {
setEditandoId(servicio.idServicio);

setFormulario({
  nombre: servicio.nombre,
  descripcion: servicio.descripcion || "",
  precio: Number(servicio.precio),
  estado: servicio.estado,
});

setMensaje("");
setError("");
setMostrarFormulario(true);

};

const cerrarFormulario = () => {
if (guardando) {
return;
}

setMostrarFormulario(false);
setEditandoId(null);
setFormulario({ ...formularioInicial });
setError("");

};

const guardarServicio = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault();

setError("");
setMensaje("");

const nombre = formulario.nombre.trim();
const precio = Number(formulario.precio);

if (!nombre) {
  setError("El nombre del servicio es obligatorio.");
  return;
}

if (!Number.isFinite(precio) || precio <= 0) {
  setError("El precio debe ser mayor que 0.");
  return;
}

const datos: ServicioRequest = {
  nombre,
  descripcion: formulario.descripcion?.trim() || "",
  precio,
  estado: formulario.estado ?? true,
};

try {
  setGuardando(true);

  if (editandoId === null) {
    await serviciosApi.create(datos);
    setMensaje("Servicio creado correctamente.");
  } else {
    await serviciosApi.update(editandoId, datos);
    setMensaje("Servicio actualizado correctamente.");
  }

  await cargarServicios();

  setMostrarFormulario(false);
  setEditandoId(null);
  setFormulario({ ...formularioInicial });
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "No se pudo guardar el servicio."
  );
} finally {
  setGuardando(false);
}

};

const eliminarServicio = async (id: number) => {
const servicio = servicios.find(
(item) => item.idServicio === id
);

if (!servicio) {
  setError("No se encontró el servicio seleccionado.");
  return;
}

const confirmar = window.confirm(
  `¿Está seguro de eliminar el servicio "${servicio.nombre}"?`
);

if (!confirmar) {
  return;
}

try {
  setError("");
  setMensaje("");
  setEliminandoId(id);

  await serviciosApi.delete(id);

  // Actualiza la tabla con los datos devueltos por el backend.
  await cargarServicios();

  setMensaje(
    `Se procesó la solicitud de eliminación de "${servicio.nombre}".`
  );
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "No se pudo eliminar el servicio."
  );
} finally {
  setEliminandoId(null);
}

};

const estilosInput = {
width: "100%",
boxSizing: "border-box" as const,
padding: "10px 12px",
border: "1px solid #d1d5db",
borderRadius: "7px",
fontSize: "14px",
};

return (
<div
style={{
padding: "32px",
backgroundColor: "#f8fafc",
minHeight: "100%",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
marginBottom: "24px",
gap: "20px",
flexWrap: "wrap",
}}
> <div>
<h1
style={{
margin: 0,
fontSize: "28px",
fontWeight: 700,
color: "#111827",
}}
>
Servicios </h1>

```
      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          color: "#6b7280",
          fontSize: "15px",
        }}
      >
        Catálogo de servicios odontológicos y precios.
      </p>
    </div>

    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() => setMostrarInactivos((actual) => !actual)}
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          padding: "11px 18px",
          backgroundColor: "#ffffff",
          color: "#374151",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {mostrarInactivos
          ? "Mostrar solo activos"
          : "Ver todos los servicios"}
      </button>

      <button
        type="button"
        onClick={abrirNuevo}
        style={{
          border: "none",
          borderRadius: "8px",
          padding: "11px 18px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Nuevo servicio
      </button>
    </div>
  </div>

  {mensaje && (
    <div
      role="status"
      style={{
        marginBottom: "20px",
        padding: "14px 16px",
        borderRadius: "8px",
        border: "1px solid #bbf7d0",
        backgroundColor: "#f0fdf4",
        color: "#166534",
      }}
    >
      {mensaje}
    </div>
  )}

  {error && (
    <div
      role="alert"
      style={{
        marginBottom: "20px",
        padding: "14px 16px",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
      }}
    >
      {error}
    </div>
  )}

  {mostrarFormulario && (
    <div
      style={{
        marginBottom: "24px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "20px",
          color: "#111827",
        }}
      >
        {editandoId === null ? "Nuevo servicio" : "Editar servicio"}
      </h2>

      <form onSubmit={guardarServicio}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
          }}
        >
          <div>
            <label
              htmlFor="servicio-nombre"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Nombre
            </label>

            <input
              id="servicio-nombre"
              type="text"
              value={formulario.nombre}
              onChange={(e) =>
                setFormulario((actual) => ({
                  ...actual,
                  nombre: e.target.value,
                }))
              }
              placeholder="Ej. Limpieza dental"
              maxLength={150}
              required
              style={estilosInput}
            />
          </div>

          <div>
            <label
              htmlFor="servicio-precio"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Precio (S/)
            </label>

            <input
              id="servicio-precio"
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.precio}
              onChange={(e) =>
                setFormulario((actual) => ({
                  ...actual,
                  precio:
                    e.target.value === ""
                      ? 0
                      : Number(e.target.value),
                }))
              }
              required
              style={estilosInput}
            />
          </div>

          <div>
            <label
              htmlFor="servicio-estado"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Estado
            </label>

            <select
              id="servicio-estado"
              value={formulario.estado ? "true" : "false"}
              onChange={(e) =>
                setFormulario((actual) => ({
                  ...actual,
                  estado: e.target.value === "true",
                }))
              }
              style={{
                ...estilosInput,
                backgroundColor: "#ffffff",
              }}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label
              htmlFor="servicio-descripcion"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Descripción
            </label>

            <textarea
              id="servicio-descripcion"
              value={formulario.descripcion || ""}
              onChange={(e) =>
                setFormulario((actual) => ({
                  ...actual,
                  descripcion: e.target.value,
                }))
              }
              placeholder="Descripción del servicio"
              maxLength={255}
              rows={3}
              style={{
                ...estilosInput,
                resize: "vertical",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "22px",
          }}
        >
          <button
            type="button"
            onClick={cerrarFormulario}
            disabled={guardando}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              padding: "10px 16px",
              backgroundColor: "#ffffff",
              color: "#374151",
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            style={{
              border: "none",
              borderRadius: "7px",
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
              cursor: guardando ? "not-allowed" : "pointer",
              opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando
              ? "Guardando..."
              : editandoId === null
                ? "Crear servicio"
                : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )}

  <div
    style={{
      marginBottom: "12px",
      color: "#6b7280",
      fontSize: "13px",
    }}
  >
    {mostrarInactivos
      ? `Mostrando todos los servicios: ${serviciosVisibles.length}`
      : `Servicios activos: ${serviciosVisibles.length}`}
  </div>

  <div
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
    }}
  >
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "800px",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {["ID", "Servicio", "Descripción", "Precio", "Estado", "Acciones"].map(
              (titulo) => (
                <th
                  key={titulo}
                  style={{
                    padding: "14px 18px",
                    textAlign:
                      titulo === "Precio"
                        ? "right"
                        : titulo === "Estado" || titulo === "Acciones"
                          ? "center"
                          : "left",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  {titulo}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {cargando ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Cargando servicios...
              </td>
            </tr>
          ) : error && servicios.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#b91c1c",
                }}
              >
                No se pudieron cargar los servicios. Revisa el mensaje
                de error e inténtalo nuevamente.
                <div style={{ marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => void cargarServicios()}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "7px",
                      padding: "8px 14px",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              </td>
            </tr>
          ) : serviciosVisibles.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                {mostrarInactivos
                  ? "No hay servicios registrados para mostrar."
                  : "No hay servicios activos. Puedes consultar los servicios inactivos."}
              </td>
            </tr>
          ) : (
            serviciosVisibles.map((servicio) => (
              <tr
                key={servicio.idServicio}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <td
                  style={{
                    padding: "15px 18px",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  {servicio.idServicio}
                </td>

                <td
                  style={{
                    padding: "15px 18px",
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {servicio.nombre}
                </td>

                <td
                  style={{
                    padding: "15px 18px",
                    color: "#6b7280",
                    fontSize: "14px",
                    maxWidth: "280px",
                  }}
                >
                  {servicio.descripcion || "Sin descripción"}
                </td>

                <td
                  style={{
                    padding: "15px 18px",
                    textAlign: "right",
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  S/ {Number(servicio.precio).toFixed(2)}
                </td>

                <td
                  style={{
                    padding: "15px 18px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: servicio.estado
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: servicio.estado
                        ? "#166534"
                        : "#991b1b",
                    }}
                  >
                    {servicio.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td
                  style={{
                    padding: "15px 18px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => abrirEditar(servicio)}
                      disabled={eliminandoId !== null}
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        backgroundColor: "#ffffff",
                        color: "#374151",
                        cursor:
                          eliminandoId !== null
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          eliminandoId !== null ? 0.6 : 1,
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void eliminarServicio(servicio.idServicio)
                      }
                      disabled={eliminandoId !== null}
                      style={{
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        padding: "7px 12px",
                        backgroundColor: "#ffffff",
                        color: "#dc2626",
                        cursor:
                          eliminandoId !== null
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          eliminandoId !== null ? 0.6 : 1,
                      }}
                    >
                      {eliminandoId === servicio.idServicio
                        ? "Procesando..."
                        : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
);
}