import React, { useEffect, useMemo, useState } from "react";

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

interface CatalogoEstado {
  id_estado: number;
  nombre_estado: string;
}

interface CatalogoAsignado {
  id_asignado_a: number;
  nombre_responsable: string;
  nivel_soporte: string;
}

const ESTADOS_CATALOGO: CatalogoEstado[] = [
  { id_estado: 1, nombre_estado: "Abierto" },
  { id_estado: 2, nombre_estado: "En Progreso" },
  { id_estado: 3, nombre_estado: "Resuelto" },
  { id_estado: 4, nombre_estado: "Cerrado" },
];

const ASIGNADOS_CATALOGO: CatalogoAsignado[] = [
  {
    id_asignado_a: 1,
    nombre_responsable: "Mesa de Ayuda ODAM",
    nivel_soporte: "Nivel 1 - Help Desk",
  },
  {
    id_asignado_a: 2,
    nombre_responsable: "Equipo de Desarrollo ODAM",
    nivel_soporte: "Nivel 2 - Desarrollo",
  },
  {
    id_asignado_a: 3,
    nombre_responsable: "Administracion BD / Infraestructura",
    nivel_soporte: "Nivel 3 - Infraestructura",
  },
];

const resolveApiBase = (): string => {
  const rawUrl =
    (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ||
    "http://localhost:8080/api";
  const cleaned = rawUrl.trim().replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

const API_BASE = resolveApiBase();

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

function formatMinutes(totalMinutes: number): string {
  const absMin = Math.max(0, Math.round(totalMinutes));
  const days = Math.floor(absMin / 1440);
  const hours = Math.floor((absMin % 1440) / 60);
  const mins = absMin % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function getSlaStatus(ticket: Ticket, nowMs: number): {
  label: string;
  bg: string;
  color: string;
  border: string;
} {
  const estadoLower = (ticket.nombre_estado || "").toLowerCase();
  const cerradoOResuelto =
    estadoLower.includes("resuelto") || estadoLower.includes("cerrado");

  const createdMs = new Date(ticket.fecha_creacion).getTime();
  if (Number.isNaN(createdMs)) {
    return {
      label: `SLA ${ticket.tiempo_sla_minutos} min`,
      bg: "#f1f5f9",
      color: "#334155",
      border: "#cbd5e1",
    };
  }

  const deadlineMs = createdMs + ticket.tiempo_sla_minutos * 60 * 1000;
  const remainingMin = (deadlineMs - nowMs) / (1000 * 60);

  if (cerradoOResuelto) {
    return {
      label: `Cumplido (${ticket.tiempo_sla_minutos}m)`,
      bg: "#dcfce7",
      color: "#166534",
      border: "#86efac",
    };
  }

  if (remainingMin < 0) {
    return {
      label: `Vencido hace ${formatMinutes(Math.abs(remainingMin))}`,
      bg: "#fee2e2",
      color: "#991b1b",
      border: "#fca5a5",
    };
  }

  if (remainingMin <= Math.max(10, ticket.tiempo_sla_minutos * 0.25)) {
    return {
      label: `Por vencer: ${formatMinutes(remainingMin)}`,
      bg: "#fef3c7",
      color: "#92400e",
      border: "#fcd34d",
    };
  }

  return {
    label: `Restan ${formatMinutes(remainingMin)}`,
    bg: "#e0f2fe",
    color: "#075985",
    border: "#7dd3fc",
  };
}

export default function Incidentes() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reloj para actualizar el tiempo SLA restante cada minuto
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Formulario de registro
  const [titulo, setTitulo] = useState("");
  const [moduloAfectado, setModuloAfectado] = useState(MODULOS_ODAM[0]);
  const [idPrioridad, setIdPrioridad] = useState<number>(2);
  const [descripcion, setDescripcion] = useState("");

  // Filtros y búsqueda
  const [searchText, setSearchText] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("ALL");
  const [filtroPrioridad, setFiltroPrioridad] = useState("ALL");
  const [filtroEstado, setFiltroEstado] = useState("ALL");

  const getAuthHeaders = (): HeadersInit => {
    let token =
      sessionStorage.getItem("odam_token") ||
      localStorage.getItem("odam_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";

    if (!token) {
      const rawAuthUser =
        sessionStorage.getItem("auth_user") ||
        localStorage.getItem("auth_user");
      if (rawAuthUser) {
        try {
          const parsed = JSON.parse(rawAuthUser) as { token?: string };
          token = parsed.token || "";
        } catch {
          // Ignorar si no es JSON válido
        }
      }
    }

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const cargarTickets = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
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
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60000);
    return () => window.clearInterval(timer);
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
      await cargarTickets(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicket = async (
    ticket: Ticket,
    patch: { id_estado?: number; id_asignado_a?: number | null }
  ) => {
    const nextEstadoId = patch.id_estado ?? ticket.id_estado;
    const nextAsignadoId =
      patch.id_asignado_a !== undefined
        ? patch.id_asignado_a
        : ticket.id_asignado_a;

    const estadoObj = ESTADOS_CATALOGO.find((e) => e.id_estado === nextEstadoId);
    const asignadoObj = ASIGNADOS_CATALOGO.find(
      (a) => a.id_asignado_a === nextAsignadoId
    );

    try {
      setUpdatingId(ticket.id_ticket);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch(`${API_BASE}/tickets/${ticket.id_ticket}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id_estado: nextEstadoId,
          id_asignado_a: nextAsignadoId,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(
          msg || `No se pudo actualizar ${ticket.codigo} (HTTP ${res.status})`
        );
      }

      // Si el backend devuelve el ticket actualizado, lo usamos; si no, aplicamos el cambio local
      let actualizado: Ticket | null = null;
      try {
        actualizado = (await res.json()) as Ticket;
      } catch {
        actualizado = null;
      }

      setTickets((prev) =>
        prev.map((item) => {
          if (item.id_ticket !== ticket.id_ticket) return item;
          if (actualizado && actualizado.id_ticket) return actualizado;
          return {
            ...item,
            id_estado: nextEstadoId,
            nombre_estado: estadoObj?.nombre_estado ?? item.nombre_estado,
            id_asignado_a: nextAsignadoId,
            nombre_responsable: asignadoObj?.nombre_responsable ?? null,
            nivel_soporte: asignadoObj?.nivel_soporte ?? null,
          };
        })
      );

      setSuccessMsg(`Incidente ${ticket.codigo} actualizado correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el incidente"
      );
      await cargarTickets(true);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filtroModulo !== "ALL" && t.modulo_afectado !== filtroModulo) {
        return false;
      }
      if (
        filtroPrioridad !== "ALL" &&
        String(t.id_prioridad) !== filtroPrioridad
      ) {
        return false;
      }
      if (filtroEstado !== "ALL" && String(t.id_estado) !== filtroEstado) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        t.codigo,
        t.titulo,
        t.descripcion,
        t.modulo_afectado,
        t.nombre_prioridad,
        t.nombre_estado,
        t.nombre_responsable ?? "",
        t.nivel_soporte ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [tickets, searchText, filtroModulo, filtroPrioridad, filtroEstado]);

  const limpiarFiltros = () => {
    setSearchText("");
    setFiltroModulo("ALL");
    setFiltroPrioridad("ALL");
    setFiltroEstado("ALL");
  };

  const hayFiltrosActivos =
    Boolean(searchText.trim()) ||
    filtroModulo !== "ALL" ||
    filtroPrioridad !== "ALL" ||
    filtroEstado !== "ALL";

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
            Gestión de Incidentes y Soporte (ODAM)
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Registro, priorización SLA, asignación y seguimiento de incidencias
            del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNowMs(Date.now());
            cargarTickets();
          }}
          disabled={loading}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Actualizando..." : "Refrescar lista"}
        </button>
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

      {/* Formulario de registro */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          padding: "18px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          marginBottom: "20px",
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
              backgroundColor: "#0f766e",
              color: "#ffffff",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {submitting ? "Registrando..." : "Registrar Ticket"}
          </button>
        </div>
      </form>

      {/* Barra de búsqueda y filtros */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          padding: "14px 18px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          marginBottom: "16px",
          alignItems: "end",
        }}
      >
        <div style={{ gridColumn: "span 2", minWidth: "220px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: 4,
              color: "#334155",
            }}
          >
            Buscar (código, título, descripción, responsable)
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Ej. #INC-001, cita, Pacientes..."
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: 4,
              color: "#334155",
            }}
          >
            Módulo
          </label>
          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="ALL">Todos los módulos</option>
            {MODULOS_ODAM.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: 4,
              color: "#334155",
            }}
          >
            Prioridad
          </label>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="ALL">Todas las prioridades</option>
            <option value="1">P1 - Crítico</option>
            <option value="2">P2 - Alto</option>
            <option value="3">P3 - Normal</option>
            <option value="4">P4 - Bajo</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: 4,
              color: "#334155",
            }}
          >
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="ALL">Todos los estados</option>
            {ESTADOS_CATALOGO.map((est) => (
              <option key={est.id_estado} value={String(est.id_estado)}>
                {est.nombre_estado}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#475569" }}>
            Mostrando <strong>{filteredTickets.length}</strong> de{" "}
            <strong>{tickets.length}</strong>
          </span>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de tickets */}
      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          backgroundColor: "#ffffff",
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
            <tr
              style={{
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <th style={{ padding: "12px" }}>Código</th>
              <th style={{ padding: "12px" }}>Título</th>
              <th style={{ padding: "12px" }}>Módulo</th>
              <th style={{ padding: "12px" }}>Prioridad</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px" }}>Asignado a</th>
              <th style={{ padding: "12px" }}>SLA restante</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: "18px", textAlign: "center" }}
                >
                  Cargando incidentes...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ padding: "18px", textAlign: "center", color: "#64748b" }}
                >
                  {hayFiltrosActivos
                    ? "No hay incidentes que coincidan con los filtros seleccionados."
                    : "No hay incidentes registrados aún."}
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => {
                const sla = getSlaStatus(t, nowMs);
                const isUpdating = updatingId === t.id_ticket;

                return (
                  <tr
                    key={t.id_ticket}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "12px", fontWeight: 600 }}>
                      {t.codigo}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: 600 }}>{t.titulo}</div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "#64748b",
                          maxWidth: "320px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={t.descripcion}
                      >
                        {t.descripcion}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>{t.modulo_afectado}</td>
                    <td style={{ padding: "12px" }}>{t.nombre_prioridad}</td>
                    <td style={{ padding: "12px" }}>
                      <select
                        aria-label={`Estado de ${t.codigo}`}
                        value={t.id_estado}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleUpdateTicket(t, {
                            id_estado: Number(e.target.value),
                          })
                        }
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          cursor: isUpdating ? "not-allowed" : "pointer",
                        }}
                      >
                        {ESTADOS_CATALOGO.map((est) => (
                          <option key={est.id_estado} value={est.id_estado}>
                            {est.nombre_estado}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <select
                        aria-label={`Responsable de ${t.codigo}`}
                        value={t.id_asignado_a ?? ""}
                        disabled={isUpdating}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateTicket(t, {
                            id_asignado_a: val ? Number(val) : null,
                          });
                        }}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                          cursor: isUpdating ? "not-allowed" : "pointer",
                          maxWidth: "260px",
                        }}
                      >
                        <option value="">Sin asignar</option>
                        {ASIGNADOS_CATALOGO.map((asig) => (
                          <option
                            key={asig.id_asignado_a}
                            value={asig.id_asignado_a}
                          >
                            {asig.nombre_responsable} ({asig.nivel_soporte})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 9px",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          backgroundColor: sla.bg,
                          color: sla.color,
                          border: `1px solid ${sla.border}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sla.label}
                      </span>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#64748b",
                          marginTop: 3,
                        }}
                      >
                        SLA base: {t.tiempo_sla_minutos} min
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
