import {
  Home,
  UserPlus,
  BookOpen,
  FileCheck,
  ScanLine,
  ClipboardList,
  Wrench,
  AlertTriangle,
  LogIn,
  FileText,
  GitBranch,
  ChevronDown,
  Lock,
  LayoutDashboard,
} from "lucide-react";

const routeNodes = [
  { path: "/", label: "Panel Principal", icon: Home, bg: "#0f766e", ring: "#2dd4bf" },
  { path: "/registro", label: "Registro", icon: UserPlus, bg: "#1d4ed8", ring: "#60a5fa" },
  { path: "/perfilamiento", label: "Historia Dental", icon: BookOpen, bg: "#6d28d9", ring: "#a78bfa" },
  { path: "/validacion", label: "Validación", icon: FileCheck, bg: "#b45309", ring: "#fbbf24" },
  { path: "/evaluacion", label: "Evaluación Dental", icon: ScanLine, bg: "#be123c", ring: "#fb7185" },
  { path: "/decision", label: "Plan de Tratamiento", icon: ClipboardList, bg: "#065f46", ring: "#34d399" },
  { path: "/contratacion", label: "Tratamientos", icon: Wrench, bg: "#1e3a5f", ring: "#93c5fd" },
  { path: "/casos-especiales", label: "Urgencias Dentales", icon: AlertTriangle, bg: "#9a3412", ring: "#fb923c" },
];

function Arrow({ dashed = false, label = "" }: { dashed?: boolean; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 my-1">
      <div
        className="w-px h-8"
        style={{
          background: dashed
            ? "repeating-linear-gradient(to bottom, #2dd4bf 0px, #2dd4bf 6px, transparent 6px, transparent 12px)"
            : "#2dd4bf",
        }}
      />
      {label && (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf", letterSpacing: "0.05em" }}
        >
          {label}
        </span>
      )}
      <ChevronDown className="w-3.5 h-3.5" style={{ color: "#2dd4bf", marginTop: "-2px" }} />
    </div>
  );
}

export function FlujoNavegacion() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0d3d36 0%, #145a50 100%)" }}
          >
            <GitBranch className="w-4.5 h-4.5 text-teal-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#0d3d36" }}>
              Flujo de Navegación
            </h1>
            <p className="text-xs" style={{ color: "#64748b" }}>
              Arquitectura de pantallas — Clínica Dental Odam · SGD v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Diagram */}
      <div className="flex flex-col items-center">

        {/* ── 1. LOGIN ── */}
        <div
          className="relative w-72 rounded-2xl p-5 flex items-center gap-4 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
            boxShadow: "0 8px 32px rgba(180,83,9,0.3)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <LogIn className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <p className="text-amber-100 text-[10px] font-semibold tracking-widest uppercase opacity-80">
              Punto de entrada
            </p>
            <p className="text-white font-bold text-base leading-tight">Login</p>
            <p className="text-amber-200 text-[11px] opacity-75 mt-0.5">
              admin · analista · aprobador
            </p>
          </div>
          {/* badge */}
          <span
            className="absolute -top-2.5 -right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#fbbf24", color: "#1c1917" }}
          >
            PÚBLICO
          </span>
        </div>

        <Arrow label="autenticado" />

        {/* ── 2. AUTH GATE ── */}
        <div
          className="flex items-center gap-2 px-5 py-2 rounded-full"
          style={{ background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.3)" }}
        >
          <Lock className="w-3 h-3" style={{ color: "#2dd4bf" }} />
          <span className="text-xs font-semibold" style={{ color: "#2dd4bf" }}>
            Sesión en localStorage · AuthContext
          </span>
        </div>

        <Arrow />

        {/* ── 3. SHELL ── */}
        <div
          className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(160deg, #0d3d36 0%, #145a50 100%)",
            boxShadow: "0 20px 60px rgba(13,61,54,0.4)",
          }}
        >
          {/* Shell header */}
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.2)" }}
            >
              <LayoutDashboard className="w-4.5 h-4.5 text-teal-300" />
            </div>
            <div>
              <p className="text-teal-300 text-[10px] font-semibold tracking-widest uppercase opacity-75">
                Layout compartido · todas las rutas autenticadas
              </p>
              <p className="text-white font-bold">DashboardLayout · Clínica Dental Odam</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(45,212,191,0.2)", color: "#2dd4bf" }}
              >
                SIDEBAR + {"<"}Outlet /{">"}
              </span>
            </div>
          </div>

          {/* Route grid */}
          <div className="p-6">
            <p className="text-teal-300 text-[10px] font-semibold tracking-widest uppercase opacity-60 mb-4">
              Rutas hijas — accesibles desde el sidebar
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {routeNodes.map((node) => {
                const Icon = node.icon;
                const isDashboard = node.path === "/";
                return (
                  <div
                    key={node.path}
                    className="relative rounded-xl p-4 flex flex-col gap-2.5 transition-transform hover:scale-105"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: isDashboard
                        ? `1.5px solid ${node.ring}`
                        : "1px solid rgba(255,255,255,0.09)",
                      boxShadow: isDashboard ? `0 0 16px ${node.ring}33` : "none",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${node.bg}99` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: node.ring }} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-tight">{node.label}</p>
                      <p className="text-teal-300 text-[10px] opacity-50 mt-0.5 font-mono">
                        {node.path}
                      </p>
                    </div>
                    {isDashboard && (
                      <span
                        className="absolute -top-2 -right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: node.ring, color: "#042f2e" }}
                      >
                        INDEX
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Programmatic arrow inside shell */}
          <div className="px-6 pb-2">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {/* dot aligned with Dashboard card */}
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: "#2dd4bf" }} />
                <div
                  className="w-px flex-1 min-h-[32px]"
                  style={{
                    background:
                      "repeating-linear-gradient(to bottom, #2dd4bf 0px, #2dd4bf 5px, transparent 5px, transparent 10px)",
                  }}
                />
                <ChevronDown className="w-3 h-3" style={{ color: "#2dd4bf", marginBottom: "4px" }} />
              </div>
              <div className="pt-0.5">
                <p className="text-teal-300 text-[10px] font-semibold opacity-60">
                  Navegación programática — solo desde Panel Principal
                </p>
              </div>
            </div>
          </div>

          {/* DetalleSolicitud inside shell (it's a child route) */}
          <div className="px-6 pb-6">
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px dashed rgba(45,212,191,0.35)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(45,212,191,0.1)" }}
              >
                <FileText className="w-4 h-4 text-teal-300" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">Detalle del Paciente</p>
                <p className="text-teal-300 text-[10px] opacity-50 font-mono">/solicitud/:id</p>
              </div>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf", border: "1px dashed #2dd4bf55" }}
              >
                DINÁMICO
              </span>
            </div>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="mt-8 w-full max-w-4xl">
          <div
            className="rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#b45309" }} />
              <span className="text-xs" style={{ color: "#64748b" }}>Pantalla pública (sin auth)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#0d3d36" }} />
              <span className="text-xs" style={{ color: "#64748b" }}>Rutas autenticadas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-0.5 flex-shrink-0"
                style={{
                  background:
                    "repeating-linear-gradient(to right, #2dd4bf 0px, #2dd4bf 5px, transparent 5px, transparent 10px)",
                }}
              />
              <span className="text-xs" style={{ color: "#64748b" }}>Navegación programática</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-5 h-3.5 rounded flex-shrink-0"
                style={{ border: "1.5px dashed #2dd4bf" }}
              />
              <span className="text-xs" style={{ color: "#64748b" }}>Ruta dinámica (:id)</span>
            </div>
          </div>
        </div>

        {/* ── Route count summary ── */}
        <div className="mt-4 w-full max-w-4xl grid grid-cols-3 gap-3 pb-8">
          {[
            { label: "Pantallas totales", value: "10", sub: "login + 9 rutas" },
            { label: "Rutas en sidebar", value: "8", sub: "acceso directo" },
            { label: "Ruta dinámica", value: "1", sub: "/solicitud/:id" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center"
              style={{ background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}
            >
              <p className="text-2xl font-bold" style={{ color: "#0d3d36" }}>{stat.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "#0d3d36" }}>{stat.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
