import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../../api/client";

interface AuditoriaRegistro {
  idAuditoria: number;
  idUsuario: number | null;
  nombreUsuario: string;
  correo: string | null;
  accion: string;
  tablaAfectada: string | null;
  idRegistro: number | null;
  descripcion: string | null;
  fecha: string | null;
}

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin fecha";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return fecha.replace("T", " ");
  }

  return fechaValida.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function obtenerTiempo(fecha: string | null): number {
  if (!fecha) return 0;

  const tiempo = new Date(fecha).getTime();
  return Number.isNaN(tiempo) ? 0 : tiempo;
}

function colorAccion(accion: string): string {
  const valor = accion.toUpperCase();

  if (valor.includes("DESACTIVAR") || valor.includes("ELIMINAR")) {
    return "bg-red-100 text-red-800";
  }

  if (valor.includes("ACTUALIZAR")) {
    return "bg-blue-100 text-blue-800";
  }

  if (valor.includes("ACTIVAR")) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (valor.includes("CREAR") || valor.includes("REGISTRO")) {
    return "bg-green-100 text-green-800";
  }

  if (valor.includes("LOGIN")) {
    return "bg-violet-100 text-violet-800";
  }

  return "bg-gray-100 text-gray-700";
}

export default function Auditoria() {
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] =
    useState<Date | null>(null);
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<AuditoriaRegistro | null>(null);

  // Evita solicitudes duplicadas sin bloquear el botón por la carga inicial.
  const solicitudEnCurso = useRef(false);
  const componenteActivo = useRef(true);

  const cargarAuditoria = useCallback(async (manual = false) => {
    if (solicitudEnCurso.current) {
      return;
    }

    solicitudEnCurso.current = true;

    if (manual) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    setError("");

    try {
      const respuesta =
        await apiFetch<AuditoriaRegistro[]>("/api/auditoria");

      if (!Array.isArray(respuesta)) {
        throw new Error(
          "El servidor no devolvió una lista de auditoría válida."
        );
      }

      const ordenados = [...respuesta].sort(
        (a, b) => obtenerTiempo(b.fecha) - obtenerTiempo(a.fecha)
      );

      if (componenteActivo.current) {
        setRegistros(ordenados);
        setUltimaActualizacion(new Date());
      }
    } catch (err) {
      console.error("Error al cargar la auditoría de ODAM:", err);

      if (componenteActivo.current) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los registros de auditoría."
        );
      }
    } finally {
      solicitudEnCurso.current = false;

      if (componenteActivo.current) {
        setCargando(false);
        setActualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    componenteActivo.current = true;
    void cargarAuditoria();

    return () => {
      componenteActivo.current = false;
    };
  }, [cargarAuditoria]);

  useEffect(() => {
    if (!registroSeleccionado) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRegistroSeleccionado(null);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [registroSeleccionado]);

  const acciones = useMemo(
    () =>
      Array.from(
        new Set(
          registros.map((registro) => registro.accion).filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [registros]
  );

  const registrosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return registros.filter((registro) => {
      const coincideAccion =
        filtroAccion === "TODAS" || registro.accion === filtroAccion;

      const fechaRegistro = registro.fecha
        ? new Date(registro.fecha)
        : null;

      const fechaValida =
        fechaRegistro !== null &&
        !Number.isNaN(fechaRegistro.getTime());

      const diaRegistro = fechaValida
        ? [
            fechaRegistro.getFullYear(),
            String(fechaRegistro.getMonth() + 1).padStart(2, "0"),
            String(fechaRegistro.getDate()).padStart(2, "0"),
          ].join("-")
        : "";

      const coincideDesde =
        !fechaDesde || (diaRegistro !== "" && diaRegistro >= fechaDesde);

      const coincideHasta =
        !fechaHasta || (diaRegistro !== "" && diaRegistro <= fechaHasta);

      const textoRegistro = [
        registro.idAuditoria,
        registro.idUsuario,
        registro.nombreUsuario,
        registro.correo,
        registro.accion,
        registro.tablaAfectada,
        registro.idRegistro,
        registro.descripcion,
        registro.fecha,
      ]
        .map((valor) => String(valor ?? ""))
        .join(" ")
        .toLowerCase();

      return (
        coincideAccion &&
        coincideDesde &&
        coincideHasta &&
        (!termino || textoRegistro.includes(termino))
      );
    });
  }, [registros, busqueda, filtroAccion, fechaDesde, fechaHasta]);

  const totalUsuarios = useMemo(
    () =>
      new Set(
        registros
          .map((registro) => registro.idUsuario)
          .filter((id): id is number => id !== null)
      ).size,
    [registros]
  );

  const totalCreaciones = useMemo(
    () =>
      registros.filter((registro) =>
        registro.accion.toUpperCase().includes("CREAR")
      ).length,
    [registros]
  );

  const totalAccesos = useMemo(
    () =>
      registros.filter((registro) =>
        registro.accion.toUpperCase().includes("LOGIN")
      ).length,
    [registros]
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroAccion("TODAS");
    setFechaDesde("");
    setFechaHasta("");
  };

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      {/* ENCABEZADO */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Auditoría del sistema
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Consulta la trazabilidad de las acciones y eventos relevantes de
            ODAM.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void cargarAuditoria(true)}
          disabled={actualizando}
          aria-busy={actualizando}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
        >
          <span aria-hidden="true">↻</span>
          {actualizando ? "Actualizando..." : "Actualizar registros"}
        </button>
      </header>

      {/* ERRORES */}
      {error && (
        <section
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-semibold">No se pudo cargar la auditoría</p>
          <p className="mt-1 break-words">{error}</p>
          <p className="mt-2">
            Comprueba que el backend esté iniciado y que tu sesión tenga
            permisos para consultar la auditoría.
          </p>
          <button
            type="button"
            onClick={() => void cargarAuditoria(true)}
            disabled={actualizando}
            className="mt-3 cursor-pointer rounded-md border border-red-300 px-3 py-1.5 font-medium hover:bg-red-100 disabled:opacity-60"
          >
            Reintentar
          </button>
        </section>
      )}

      {/* ESTADÍSTICAS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Eventos registrados
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {cargando ? "—" : registros.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Total de registros de auditoría
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Usuarios identificados
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {cargando ? "—" : totalUsuarios}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Usuarios distintos asociados a eventos
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Creaciones registradas
          </p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {cargando ? "—" : totalCreaciones}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Acciones que contienen CREAR
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Inicios de sesión
          </p>
          <p className="mt-2 text-3xl font-bold text-violet-700">
            {cargando ? "—" : totalAccesos}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Eventos LOGIN registrados
          </p>
        </div>
      </section>

      {/* HISTORIAL */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4 md:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Historial de operaciones
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Busca, filtra y consulta los detalles de los eventos registrados.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[440px]">
              <div>
                <label
                  htmlFor="buscar-auditoria"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Buscar
                </label>
                <input
                  id="buscar-auditoria"
                  type="search"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Usuario, acción, descripción..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="filtro-accion"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Filtrar por acción
                </label>
                <select
                  id="filtro-accion"
                  value={filtroAccion}
                  onChange={(event) => setFiltroAccion(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="TODAS">Todas las acciones</option>
                  {acciones.map((accion) => (
                    <option key={accion} value={accion}>
                      {accion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FILTRO POR FECHAS */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="fecha-desde"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Fecha desde
              </label>
              <input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                max={fechaHasta || undefined}
                onChange={(event) => setFechaDesde(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="fecha-hasta"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Fecha hasta
              </label>
              <input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                min={fechaDesde || undefined}
                onChange={(event) => setFechaHasta(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <p>
              Mostrando{" "}
              <span className="font-semibold text-gray-900">
                {registrosFiltrados.length}
              </span>{" "}
              de {registros.length} registros
            </p>

            {ultimaActualizacion && (
              <p>
                Última consulta:{" "}
                {ultimaActualizacion.toLocaleTimeString("es-PE")}
              </p>
            )}
          </div>
        </div>

        {/* ESTADOS DE CARGA */}
        {cargando ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-3 text-sm text-gray-500">
              Cargando registros de auditoría...
            </p>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-800">
              No se encontraron registros
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Prueba con otra búsqueda o cambia los filtros.
            </p>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    Fecha y hora
                  </th>
                  <th className="min-w-[190px] border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    Usuario responsable
                  </th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    Acción
                  </th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    Tabla afectada
                  </th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    ID registro
                  </th>
                  <th className="min-w-[260px] border-b border-gray-200 px-4 py-3 font-semibold text-gray-600">
                    Descripción
                  </th>
                  <th className="whitespace-nowrap border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-600">
                    Detalle
                  </th>
                </tr>
              </thead>

              <tbody>
                {registrosFiltrados.map((registro) => (
                  <tr
                    key={registro.idAuditoria}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3 font-semibold text-gray-900">
                      #{registro.idAuditoria}
                    </td>

                    <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3 text-gray-600">
                      {formatearFecha(registro.fecha)}
                    </td>

                    <td className="border-b border-gray-100 px-4 py-3">
                      <p className="break-words font-medium text-gray-900">
                        {registro.nombreUsuario || "Usuario no disponible"}
                      </p>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {registro.correo || "Sin correo"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        ID usuario: {registro.idUsuario ?? "N/D"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colorAccion(
                          registro.accion
                        )}`}
                      >
                        {registro.accion || "N/D"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3 text-gray-700">
                      {registro.tablaAfectada || "N/D"}
                    </td>

                    <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3 text-gray-700">
                      {registro.idRegistro ?? "N/D"}
                    </td>

                    <td className="border-b border-gray-100 px-4 py-3 text-gray-600 [overflow-wrap:anywhere]">
                      {registro.descripcion || "Sin descripción"}
                    </td>

                    <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setRegistroSeleccionado(registro)}
                        className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        aria-label={`Ver detalle del evento ${registro.idAuditoria}`}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* VENTANA DE DETALLE */}
      {registroSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRegistroSeleccionado(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-auditoria"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="titulo-detalle-auditoria"
                  className="text-xl font-bold text-gray-900"
                >
                  Detalle del evento
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Registro #{registroSeleccionado.idAuditoria}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRegistroSeleccionado(null)}
                className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
                aria-label="Cerrar detalle"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Fecha y hora
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatearFecha(registroSeleccionado.fecha)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Acción realizada
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colorAccion(
                      registroSeleccionado.accion
                    )}`}
                  >
                    {registroSeleccionado.accion || "N/D"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Usuario responsable
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                  {registroSeleccionado.nombreUsuario ||
                    "Usuario no disponible"}
                </p>
                <p className="mt-1 break-all text-sm text-gray-600">
                  {registroSeleccionado.correo || "Sin correo"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  ID usuario: {registroSeleccionado.idUsuario ?? "N/D"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Registro afectado
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  Tabla: {registroSeleccionado.tablaAfectada || "N/D"}
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  ID registro: {registroSeleccionado.idRegistro ?? "N/D"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Descripción completa
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                  {registroSeleccionado.descripcion ||
                    "Sin descripción disponible"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setRegistroSeleccionado(null)}
                className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                Cerrar detalle
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}