import React, { useEffect, useState } from "react";

interface Ticket {
  id_ticket: number;
  codigo: string;
  titulo: string;
  modulo_afectado: string;
  descripcion: string;
  fecha_creacion: string;
  id_estado: number;
  nombre_estado: string;
  id_prioridad: number;
  nombre_prioridad: string;
  tiempo_sla_minutos: number;
  id_asignado_a: number | null;
  nombre_responsable: string | null;
  nivel_soporte: string | null;
}

const API_BASE =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ||
  "http://localhost:8080/api";

const MODULOS_ODAM = [
  "Autenticación y Usuarios",
  "Pacientes",
  "Citas y Agenda",
  "Reprogramaciones",
  "Historias Clínicas",
  "Tratamientos y Servicios",
  "Pagos y Facturación",
  "Auditoría",
];

export default function Incidentes() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [moduloAfectado, setModuloAfectado] = useState(MODULOS_ODAM[0]);
  const [idPrioridad, setIdPrioridad] = useState<number>(2);
  const [descripcion, setDescripcion] = useState("");

  const getAuthHeaders = (): HeadersInit => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const cargarTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/tickets`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Error al cargar tickets (HTTP ${res.status})`);
      }
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) {
      setError("Completa el título y la descripción del incidente.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          titulo: titulo.trim(),
          modulo_afectado: moduloAfectado,
          id_prioridad: Number(idPrioridad),
          descripcion: descripcion.trim(),
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error al registrar ticket (HTTP ${res.status})`);
      }

      const creado: Ticket = await res.json();
      setSuccessMsg(`Incidente ${creado.codigo} registrado correctamente.`);
      setTitulo("");
      setDescripcion("");
      setIdPrioridad(2);
      await cargarTickets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
          Gestión de Incidentes y Soporte (ODAM)
        </h1>
        <p style={{ margin: "6px 0 0", color: "#64748b" }}>
          Registro, priorización SLA y seguimiento de incidencias del sistema.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            backgroundColor: "#dcfce7",
            color: "#166534",
          }}
        >
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          padding: "18px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
        }}
      >
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Título del incidente
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Error al guardar cita médica"
            required
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Módulo afectado
          </label>
          <select
            value={moduloAfectado}
            onChange={(e) => setModuloAfectado(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
            }}
          >
            {MODULOS_ODAM.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Prioridad (SLA)
          </label>
          <select
            value={idPrioridad}
            onChange={(e) => setIdPrioridad(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
            }}
          >
            <option value={1}>P1 - Crítico (15 min)</option>
            <option value={2}>P2 - Alto (60 min)</option>
            <option value={3}>P3 - Normal (240 min)</option>
            <option value={4}>P4 - Bajo (1440 min)</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Descripción detallada
          </label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe qué ocurrió, pasos para reproducir y pantalla afectada..."
            required
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
            }}
          />
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {submitting ? "Registrando..." : "Registrar Ticket"}
          </button>
        </div>
      </form>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px" }}>Código</th>
              <th style={{ padding: "12px" }}>Título</th>
              <th style={{ padding: "12px" }}>Módulo</th>
              <th style={{ padding: "12px" }}>Prioridad</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Asignado a</th>
              <th style={{ padding: "12px" }}>SLA</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: "16px", textAlign: "center" }}
                >
                  Cargando incidentes...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: "16px", textAlign: "center" }}
                >
                  No hay incidentes registrados aún.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr
                  key={t.id_ticket}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "12px", fontWeight: 600 }}>{t.codigo}</td>
                  <td style={{ padding: "12px" }}>{t.titulo}</td>
                  <td style={{ padding: "12px" }}>{t.modulo_afectado}</td>
                  <td style={{ padding: "12px" }}>{t.nombre_prioridad}</td>
                  <td style={{ padding: "12px" }}>{t.nombre_estado}</td>
                  <td style={{ padding: "12px" }}>
                    {t.nombre_responsable
                      ? `${t.nombre_responsable} (${t.nivel_soporte ?? ""})`
                      : "Sin asignar"}
                  </td>
                  <td style={{ padding: "12px" }}>{t.tiempo_sla_minutos} min</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
