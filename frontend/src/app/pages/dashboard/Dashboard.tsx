
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Users,
  CalendarDays,
  Activity,
  Wallet,
  UserPlus,
  CalendarPlus,
  ClipboardList,
  FileText,
  ArrowRight,
  Clock3,
  Stethoscope,
  HeartPulse,
  UserRound,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { pacientesApi } from "../../api/pacientesApi";
import {
  citasApi,
  type CitaResponse,
} from "../../api/citasApi";
import { tratamientosApi } from "../../api/tratamientosApi";
import { pagosApi } from "../../api/pagosApi";

const indicadores = [
  {
    titulo: "Total de pacientes",
    descripcion: "Pacientes registrados",
    icono: Users,
    color: "#0d9488",
    fondo: "#ccfbf1",
    ruta: "/pacientes",
  },
  {
    titulo: "Citas de hoy",
    descripcion: "Agenda de atención",
    icono: CalendarDays,
    color: "#2563eb",
    fondo: "#dbeafe",
    ruta: "/citas",
  },
  {
    titulo: "Tratamientos activos",
    descripcion: "Tratamientos en curso",
    icono: Activity,
    color: "#7c3aed",
    fondo: "#ede9fe",
    ruta: "/tratamientos",
  },
  {
    titulo: "Pagos registrados",
    descripcion: "Consulta de movimientos",
    icono: Wallet,
    color: "#d97706",
    fondo: "#fef3c7",
    ruta: "/pagos",
  },
];

const accesos = [
  {
    titulo: "Registrar paciente",
    descripcion: "Incorporar un paciente al sistema",
    icono: UserPlus,
    ruta: "/pacientes/nuevo",
    color: "#0d9488",
  },
  {
    titulo: "Programar una cita",
    descripcion: "Gestionar la agenda odontológica",
    icono: CalendarPlus,
    ruta: "/citas/nueva",
    color: "#2563eb",
  },
  {
    titulo: "Historias clínicas",
    descripcion: "Consultar información clínica",
    icono: FileText,
    ruta: "/historias",
    color: "#7c3aed",
  },
  {
    titulo: "Ver tratamientos",
    descripcion: "Revisar los tratamientos registrados",
    icono: ClipboardList,
    ruta: "/tratamientos",
    color: "#d97706",
  },
];

type ValoresIndicadores = {
  pacientes: string;
  citas: string;
  tratamientos: string;
  pagos: string;
};

const valoresIniciales: ValoresIndicadores = {
  pacientes: "—",
  citas: "—",
  tratamientos: "—",
  pagos: "—",
};

const clasesEstado: Record<string, string> = {
  PROGRAMADA: "bg-blue-50 text-blue-700",
  ATENDIDA: "bg-emerald-50 text-emerald-700",
  REPROGRAMADA: "bg-amber-50 text-amber-700",
  CANCELADA: "bg-red-50 text-red-700",
};

function obtenerFechaLocal(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function formatearHora(hora?: string): string {
  if (!hora) return "Hora no disponible";

  const partes = hora.split(":");

  if (partes.length < 2) return hora;

  const horas = Number(partes[0]);
  const minutos = partes[1];

  if (Number.isNaN(horas)) return hora;

  const sufijo = horas >= 12 ? "p. m." : "a. m.";
  const hora12 = horas % 12 || 12;

  return `${hora12}:${minutos} ${sufijo}`;
}

function formatearEstado(estado?: string): string {
  if (!estado) return "Sin estado";

  return estado.replace(/_/g, " ");
}

export default function Dashboard() {
  const [indicadoresReales, setIndicadoresReales] =
    useState<ValoresIndicadores>(valoresIniciales);

  const [citasAgenda, setCitasAgenda] =
    useState<CitaResponse[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorAgenda, setErrorAgenda] = useState(false);

  const fechaActual = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    let activo = true;

    async function cargarDatosDashboard() {
      setCargando(true);

      try {
        const hoy = obtenerFechaLocal();

        const resultados = await Promise.allSettled([
          pacientesApi.list(),
          citasApi.list(),
          tratamientosApi.list(),
          pagosApi.list(),
        ]);

        if (!activo) return;

        const [pacientes, citas, tratamientos, pagos] =
          resultados;

        if (pacientes.status === "fulfilled") {
          setIndicadoresReales((anteriores) => ({
            ...anteriores,
            pacientes: String(pacientes.value.length),
          }));
        }

        if (citas.status === "fulfilled") {
          const citasDelDia = citas.value
            .filter(
              (cita) =>
                cita.fechaCita?.slice(0, 10) === hoy &&
                cita.estado !== "CANCELADA",
            )
            .sort((a, b) =>
              (a.horaCita ?? "").localeCompare(
                b.horaCita ?? "",
              ),
            );

          setCitasAgenda(citasDelDia);
          setErrorAgenda(false);

          setIndicadoresReales((anteriores) => ({
            ...anteriores,
            citas: String(citasDelDia.length),
          }));
        } else {
          setErrorAgenda(true);
          setCitasAgenda([]);
        }

        if (tratamientos.status === "fulfilled") {
          const tratamientosActivos =
            tratamientos.value.filter(
              (tratamiento) =>
                tratamiento.estado === "PENDIENTE" ||
                tratamiento.estado === "EN_PROCESO",
            );

          setIndicadoresReales((anteriores) => ({
            ...anteriores,
            tratamientos: String(tratamientosActivos.length),
          }));
        }

        if (pagos.status === "fulfilled") {
          setIndicadoresReales((anteriores) => ({
            ...anteriores,
            pagos: String(pagos.value.length),
          }));
        }
      } catch (error) {
        console.error(
          "Error al cargar el panel principal de ODAM:",
          error,
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDatosDashboard();

    return () => {
      activo = false;
    };
  }, []);

  const indicadoresActualizados = indicadores.map((item) => {
    let valor = "—";

    switch (item.titulo) {
      case "Total de pacientes":
        valor = indicadoresReales.pacientes;
        break;

      case "Citas de hoy":
        valor = indicadoresReales.citas;
        break;

      case "Tratamientos activos":
        valor = indicadoresReales.tratamientos;
        break;

      case "Pagos registrados":
        valor = indicadoresReales.pagos;
        break;
    }

    return { ...item, valor };
  });

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8">
      {/* Encabezado */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-700">
            <Stethoscope size={18} />
            Sistema de Gestión Dental ODAM
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Panel principal
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Bienvenido al centro de operaciones de la clínica.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold capitalize text-slate-700">
            <CalendarDays
              size={17}
              className="text-teal-700"
            />
            {fechaActual}
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Resumen de gestión odontológica
          </p>
        </div>
      </section>

      {/* Bienvenida */}
      <section className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <HeartPulse size={26} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Tu clínica, organizada en un solo lugar
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Administra la atención de tus pacientes, organiza
              las citas y supervisa las actividades de tu clínica
              desde el panel principal de ODAM.
            </p>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Resumen general
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Indicadores principales de la clínica.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {indicadoresActualizados.map((item) => {
            const Icono = item.icono;

            return (
              <Link
                key={item.titulo}
                to={item.ruta}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.titulo}
                    </p>

                    <p className="mt-4 text-3xl font-bold text-slate-800">
                      {item.valor}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {item.descripcion}
                    </p>
                  </div>

                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: item.fondo,
                      color: item.color,
                    }}
                  >
                    <Icono size={23} />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-teal-700">
                  Ir al módulo
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {cargando && (
          <p
            className="mt-3 text-xs text-slate-400"
            role="status"
          >
            Actualizando indicadores...
          </p>
        )}
      </section>

      {/* Accesos rápidos */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Accesos rápidos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Entra directamente a las operaciones más utilizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {accesos.map((item) => {
            const Icono = item.icono;

            return (
              <Link
                key={item.titulo}
                to={item.ruta}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  <Icono size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800">
                    {item.titulo}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.descripcion}
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Agenda y gestión clínica */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Agenda de citas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-800">
                Agenda de citas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulta las citas programadas para hoy.
              </p>
            </div>

            <Link
              to="/citas"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              Ver todas las citas
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {cargando ? (
              <div
                className="flex flex-col items-center justify-center rounded-xl border border-slate-100 px-5 py-10 text-center"
                role="status"
              >
                <LoaderCircle
                  size={30}
                  className="animate-spin text-teal-700"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Cargando las citas de hoy...
                </p>
              </div>
            ) : errorAgenda ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
                <AlertCircle
                  size={30}
                  className="mx-auto text-amber-600"
                />

                <h3 className="mt-3 font-semibold text-amber-800">
                  No se pudo cargar la agenda
                </h3>

                <p className="mt-2 text-sm leading-6 text-amber-700">
                  No fue posible obtener las citas del servidor.
                  Comprueba la conexión con el backend y consulta
                  el módulo de citas.
                </p>

                <Link
                  to="/citas"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Abrir módulo de citas
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : citasAgenda.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <CalendarDays size={27} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No hay citas para hoy
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Cuando existan citas programadas para esta
                  fecha, aparecerán aquí con sus datos de
                  atención.
                </p>

                <Link
                  to="/citas"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  Consultar agenda
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              citasAgenda.map((cita) => (
                <div
                  key={cita.idCita}
                  className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <Clock3 size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {formatearHora(cita.horaCita)}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {cita.servicio ||
                            "Consulta odontológica"}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <UserRound
                            size={15}
                            className="shrink-0"
                          />
                          <span>
                            {cita.paciente ||
                              "Paciente no especificado"}
                          </span>
                        </p>

                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Stethoscope
                            size={15}
                            className="shrink-0"
                          />
                          <span>
                            {cita.odontologo ||
                              "Odontólogo no asignado"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        clasesEstado[cita.estado] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cita.estado === "ATENDIDA" && (
                        <CheckCircle2 size={13} />
                      )}

                      {formatearEstado(cita.estado)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {!cargando &&
            !errorAgenda &&
            citasAgenda.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  {citasAgenda.length}{" "}
                  {citasAgenda.length === 1
                    ? "cita para hoy"
                    : "citas para hoy"}
                </p>

                <Link
                  to="/citas"
                  className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                  Administrar agenda →
                </Link>
              </div>
            )}
        </div>

        {/* Gestión clínica */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-800">
            Gestión clínica
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Accesos complementarios.
          </p>

          <div className="mt-5 space-y-3">
            <Link
              to="/historias"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
            >
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <FileText size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Historias clínicas
                </p>

                <p className="text-xs text-slate-400">
                  Expedientes de pacientes
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </Link>

            <Link
              to="/evaluaciones"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
            >
              <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
                <Activity size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Evaluaciones clínicas
                </p>

                <p className="text-xs text-slate-400">
                  Revisiones odontológicas
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </Link>

            <Link
              to="/horarios"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
            >
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <Clock3 size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Horarios
                </p>

                <p className="text-xs text-slate-400">
                  Organización de disponibilidad
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </Link>

            <Link
              to="/pagos"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
            >
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Wallet size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Pagos
                </p>

                <p className="text-xs text-slate-400">
                  Gestión de movimientos
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Pie */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        ODAM · Sistema de Gestión Dental · Panel principal
      </footer>
    </div>
  );
}