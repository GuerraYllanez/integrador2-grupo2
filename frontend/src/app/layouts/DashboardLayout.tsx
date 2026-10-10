import { Link, Outlet, useLocation } from "react-router";
import {
  Home,
  UserPlus,
  BookOpen,
  FileCheck,
  ScanLine,
  ClipboardList,
  Wrench,
  AlertTriangle,
  Menu,
  LogOut,
  SmilePlus,
  GitBranch,
  Clock, CreditCard, Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const menuItems = [
  { path: "/", label: "Panel Principal", icon: Home },
  { path: "/pacientes", label: "Pacientes", icon: UserPlus },
  { path: "/historias", label: "Historias clínicas", icon: BookOpen },
  { path: "/evaluaciones", label: "Evaluaciones", icon: ScanLine },
  { path: "/tratamientos", label: "Tratamientos", icon: Wrench },
  { path: "/citas", label: "Citas", icon: ClipboardList },
  { path: "/horarios", label: "Horarios", icon: Clock },
  { path: "/pagos", label: "Pagos", icon: CreditCard },
  { path: "/reprogramaciones", label: "Reprogramaciones", icon: GitBranch },
  { path: "/servicios", label: "Servicios", icon: FileCheck },
  { path: "/odontologos", label: "Odontólogos", icon: SmilePlus },
  { path: "/marketing", label: "Marketing", icon: UserPlus },
  { path: "/casos-especiales", label: "Casos especiales", icon: AlertTriangle },
  { path: "/auditoria", label: "Auditoría", icon: Shield },
];

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen" style={{ background: "#f0fdfa" }}>
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-[68px]"} flex flex-col transition-all duration-300`}
        style={{ background: "linear-gradient(180deg, #0d3d36 0%, #145a50 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className={`flex items-center gap-2.5 overflow-hidden transition-all ${sidebarOpen ? "w-full" : "w-0 opacity-0"}`}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#14b8a6" }}
            >
              <SmilePlus className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clínica Dental Odam</p>
              <p className="text-teal-300 text-[10px] mt-0.5 opacity-70">Gestión Dental</p>
            </div>
          </div>
          {!sidebarOpen && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: "#14b8a6" }}>
              <SmilePlus className="w-4 h-4 text-white" />
            </div>
          )}
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-teal-300 hover:text-white hover:bg-white/10 h-7 w-7 p-0 flex-shrink-0"
            >
              <Menu className="size-4" />
            </Button>
          )}
        </div>

        {/* Collapse toggle when closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mx-auto mt-3 text-teal-300 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
          >
            <Menu className="size-4" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto mt-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    !sidebarOpen ? "justify-center" : ""
                  }`}
                  style={
                    isActive
                      ? { background: "rgba(20,184,166,0.18)", color: "#2dd4bf" }
                      : { color: "rgba(204,251,241,0.65)" }
                  }
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = ""; }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="size-4 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {user && sidebarOpen && (
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "#0f766e", border: "1px solid rgba(45,212,191,0.3)" }}
              >
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-teal-300 text-[10px] truncate opacity-70">{user.role}</p>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="text-teal-400 hover:text-red-300 transition-colors p-1 rounded flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {!sidebarOpen && (
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="w-full flex justify-center text-teal-400 hover:text-red-300 transition-colors py-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
