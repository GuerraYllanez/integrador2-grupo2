import { useState } from "react";
import {
  Eye,
  EyeOff,
  SmilePlus,
  Shield,
  ClipboardList,
  ScanLine,
  AlertCircle,
} from "lucide-react";
import { type AuthUser } from "../../types/auth";
import { login } from "../../api/authApi";

type LoginProps = {
  onLogin: (user: AuthUser) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Por favor complete todos los campos.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await login({
        correo: username,
        contrasena: password,
      });

      const roleLabel: Record<string, string> = {
        ADMINISTRADOR: "Administrador del Sistema",
        PACIENTE: "Paciente",
        ODONTOLOGO: "Odontólogo",
        RECEPCION: "Recepción",
        MARKETING: "Marketing",
        ANALISTA: "Analista",
        APROBADOR: "Aprobador",
      };

      const displayName = response.nombreUsuario || response.correo;

      const authUser: AuthUser = {
        name: displayName,
        role: roleLabel[response.rol] || response.rol,
        username: response.correo,
        avatar: displayName.slice(0, 2).toUpperCase(),
        token: response.token,
      };

      onLogin(authUser);
    } catch (error) {
      console.error("Error de login:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Usuario o contraseña incorrectos. Verifique sus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* PANEL IZQUIERDO */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, #0d3d36 0%, #145a50 50%, #0f7064 100%)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #5eead4 0%, transparent 70%)",
          }}
        />

        <div
          className="absolute -bottom-16 -left-16 w-[360px] h-[360px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Crect x='24' y='10' width='12' height='40' rx='2'/%3E%3Crect x='10' y='24' width='40' height='12' rx='2'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full opacity-[0.06]"
          style={{ border: "1px solid #ffffff" }}
        />

        {/* LOGO */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#14b8a6" }}
          >
            <SmilePlus className="w-5 h-5 text-white" />
          </div>

          <div>
            <p
              className="text-white font-bold text-lg leading-none"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Clínica Dental Odam
            </p>

            <p className="text-teal-300 text-xs mt-0.5">
              Sistema de Gestión Dental
            </p>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1
              className="text-white font-bold leading-tight"
              style={{
                fontSize: "2.6rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Atención
              <br />
              <span style={{ color: "#2dd4bf" }}>centrada</span>
              <br />
              en tu sonrisa
            </h1>

            <p className="text-teal-100 mt-4 text-base leading-relaxed max-w-xs opacity-80">
              Plataforma integral para la gestión de pacientes,
              evaluación odontológica y seguimiento de tratamientos
              dentales.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: ClipboardList,
                label: "Registro e historia odontológica",
              },
              {
                icon: ScanLine,
                label: "Evaluación dental, radiografías y diagnóstico",
              },
              {
                icon: Shield,
                label: "Validación de identidad y cobertura dental",
              },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(45,212,191,0.15)",
                    border: "1px solid rgba(45,212,191,0.3)",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "#2dd4bf" }}
                  />
                </div>

                <span className="text-teal-100 text-sm opacity-90">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="relative z-10">
          <p className="text-teal-400 text-xs opacity-60">
            © 2025 Clínica Dental Odam · SGD v1.0.0
          </p>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#f0fdfa" }}
      >
        <div className="w-full max-w-md">
          {/* LOGO MOBILE */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#0f766e" }}
            >
              <SmilePlus className="w-5 h-5 text-white" />
            </div>

            <div>
              <p
                className="font-bold text-gray-900 text-lg leading-none"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Clínica Dental Odam
              </p>

              <p className="text-gray-500 text-xs mt-0.5">
                Sistema de Gestión Dental
              </p>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl shadow-sm border p-8"
            style={{ borderColor: "#ccfbf1" }}
          >
            {/* HEADER CENTRADO */}
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)",
                    border: "1px solid #99f6e4",
                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.08)",
                  }}
                >
                  <Shield
                    className="w-7 h-7"
                    style={{ color: "#0f766e" }}
                  />
                </div>
              </div>

              <h2
                className="font-bold text-gray-900 tracking-tight"
                style={{
                  fontSize: "1.8rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "-0.025em",
                }}
              >
                Iniciar sesión
              </h2>

              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Ingrese sus credenciales para acceder al sistema clínico.
              </p>

              <div
                className="mx-auto mt-4 h-1 w-12 rounded-full"
                style={{ background: "#14b8a6" }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />

                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* CORREO */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Ej: admin@odam.com"
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-lg border text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-all"
                  style={{
                    background: "#f0fdfa",
                    borderColor: "#99f6e4",
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(20,184,166,0.15)";
                    e.target.style.borderColor = "#14b8a6";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "";
                    e.target.style.borderColor = "#99f6e4";
                  }}
                />
              </div>

              {/* CONTRASEÑA */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border text-gray-900 placeholder-gray-400 text-sm focus:outline-none transition-all"
                    style={{
                      background: "#f0fdfa",
                      borderColor: "#99f6e4",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: isLoading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #0d3d36 0%, #0f766e 100%)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>

                    Verificando...
                  </>
                ) : (
                  "Ingresar al sistema"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Acceso restringido · Solo personal autorizado de la clínica
          </p>
        </div>
      </div>
    </div>
  );
}