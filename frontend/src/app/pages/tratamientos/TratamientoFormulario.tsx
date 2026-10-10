import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router";

import { Card } from "../../components/ui/card";
import { apiFetch } from "../../api/client";
import {
  tratamientosApi,
  type EstadoTratamiento,
} from "../../api/tratamientosApi";

type Historia = {
  idHistoria: number;
  codigoHistoria?: string;
  paciente?: {
    nombres?: string;
    apellidos?: string;
  };
};

type Odontologo = {
  idOdontologo: number;
  nombres?: string;
  apellidos?: string;
  especialidad?: string;
};

type Servicio = {
  idServicio: number;
  nombre: string;
  precio: number;
};

export default function TratamientoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicion = Boolean(id);

  const [historias, setHistorias] = useState<Historia[]>([]);
  const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [idHistoria, setIdHistoria] = useState("");
  const [idOdontologo, setIdOdontologo] = useState("");
  const [idServicio, setIdServicio] = useState("");

  const [descripcion, setDescripcion] = useState("");

  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [fechaFin, setFechaFin] = useState("");

  const [estado, setEstado] =
    useState<EstadoTratamiento>("PENDIENTE");

  const [observaciones, setObservaciones] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          historiasData,
          odontologosData,
          serviciosData,
        ] = await Promise.all([
          apiFetch<Historia[]>("/api/historias"),
          apiFetch<Odontologo[]>("/api/odontologos"),
          apiFetch<Servicio[]>("/api/servicios"),
        ]);

        setHistorias(historiasData);
        setOdontologos(odontologosData);
        setServicios(serviciosData);

        if (modoEdicion && id) {
          const tratamiento =
            await tratamientosApi.get(id);

          setIdHistoria(
            String(tratamiento.idHistoria)
          );

          setIdOdontologo(
            String(tratamiento.idOdontologo)
          );

          setIdServicio(
            String(tratamiento.idServicio)
          );

          setDescripcion(
            tratamiento.descripcion ?? ""
          );

          setFechaInicio(
            tratamiento.fechaInicio
          );

          setFechaFin(
            tratamiento.fechaFin ?? ""
          );

          setEstado(
            tratamiento.estado
          );

          setObservaciones(
            tratamiento.observaciones ?? ""
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : modoEdicion
              ? "No se pudo cargar el tratamiento."
              : "No se pudieron cargar los datos del formulario."
        );
      } finally {
        setLoading(false);
      }
    };

    void cargarDatos();
  }, [id, modoEdicion]);

  const historiaSeleccionada = historias.find(
    (historia) =>
      String(historia.idHistoria) === idHistoria
  );

  const servicioSeleccionado = servicios.find(
    (servicio) =>
      String(servicio.idServicio) === idServicio
  );

  const obtenerNombrePaciente = (
    historia: Historia
  ) => {
    if (!historia.paciente) {
      return "Paciente no disponible";
    }

    return `${historia.paciente.nombres ?? ""} ${
      historia.paciente.apellidos ?? ""
    }`.trim();
  };

  const guardar = async () => {
    if (guardando) {
      return;
    }

    setError("");
    setExito("");

    if (!idHistoria) {
      setError(
        "Debes seleccionar una historia clínica."
      );
      return;
    }

    if (!idOdontologo) {
      setError(
        "Debes seleccionar un odontólogo."
      );
      return;
    }

    if (!idServicio) {
      setError(
        "Debes seleccionar un servicio."
      );
      return;
    }

    if (!fechaInicio) {
      setError(
        "Debes indicar la fecha de inicio."
      );
      return;
    }

    if (
      fechaFin &&
      fechaFin < fechaInicio
    ) {
      setError(
        "La fecha de finalización no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    const datos = {
      idHistoria: Number(idHistoria),
      idOdontologo: Number(idOdontologo),
      idServicio: Number(idServicio),
      descripcion:
        descripcion.trim() || undefined,
      fechaInicio,
      fechaFin:
        fechaFin || undefined,
      estado,
      observaciones:
        observaciones.trim() || undefined,
    };

    try {
      setGuardando(true);

      if (modoEdicion && id) {
        await tratamientosApi.update(
          id,
          datos
        );

        setExito(
          "Tratamiento actualizado correctamente."
        );
      } else {
        await tratamientosApi.create(
          datos
        );

        setExito(
          "Tratamiento registrado correctamente."
        );
      }

      setTimeout(() => {
        navigate("/tratamientos", {
          replace: true,
        });
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : modoEdicion
            ? "No se pudo actualizar el tratamiento."
            : "No se pudo registrar el tratamiento."
      );

      setGuardando(false);
    }
  };

  const manejarSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    void guardar();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-teal-700">
            ODAM · Gestión clínica
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {modoEdicion
              ? "Editar Tratamiento"
              : "Nuevo Tratamiento"}
          </h1>

          <p className="mt-2 text-gray-500">
            {modoEdicion
              ? "Actualización de la información del tratamiento odontológico."
              : "Registro del inicio de un nuevo tratamiento odontológico."}
          </p>
        </div>

        <Card className="p-10 text-center">
          <p className="text-sm text-gray-500">
            Cargando información...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">
            ODAM · Gestión clínica
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {modoEdicion
              ? "Editar Tratamiento"
              : "Nuevo Tratamiento"}
          </h1>

          <p className="mt-2 text-gray-500">
            {modoEdicion
              ? "Actualiza la información clínica y administrativa del tratamiento."
              : "T01 · Inicio del tratamiento y registro del plan odontológico"}
          </p>
        </div>

        <Link
          to="/tratamientos"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a tratamientos
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {exito && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            {exito}
          </p>
        </div>
      )}

      <form onSubmit={manejarSubmit}>
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
                T01
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {modoEdicion
                    ? "Editar información del tratamiento"
                    : "Inicio del Tratamiento"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {modoEdicion
                    ? "Modifica los datos registrados del tratamiento."
                    : "Registra la información clínica del tratamiento."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6">
            <section>
              <h3 className="text-lg font-bold text-gray-900">
                Información clínica
              </h3>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="historia"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Historia clínica
                  </label>

                  <select
                    id="historia"
                    value={idHistoria}
                    onChange={(e) =>
                      setIdHistoria(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="">
                      Seleccionar historia clínica
                    </option>

                    {historias.map(
                      (historia) => (
                        <option
                          key={
                            historia.idHistoria
                          }
                          value={
                            historia.idHistoria
                          }
                        >
                          {historia.codigoHistoria ||
                            `HC-${historia.idHistoria}`}{" "}
                          —{" "}
                          {obtenerNombrePaciente(
                            historia
                          )}
                        </option>
                      )
                    )}
                  </select>

                  {historiaSeleccionada && (
                    <p className="mt-2 text-xs text-gray-500">
                      Paciente:{" "}
                      <strong>
                        {obtenerNombrePaciente(
                          historiaSeleccionada
                        )}
                      </strong>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="odontologo"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Odontólogo
                  </label>

                  <select
                    id="odontologo"
                    value={idOdontologo}
                    onChange={(e) =>
                      setIdOdontologo(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="">
                      Seleccionar odontólogo
                    </option>

                    {odontologos.map(
                      (odontologo) => (
                        <option
                          key={
                            odontologo.idOdontologo
                          }
                          value={
                            odontologo.idOdontologo
                          }
                        >
                          {odontologo.nombres ??
                            ""}{" "}
                          {odontologo.apellidos ??
                            ""}
                          {odontologo.especialidad
                            ? ` — ${odontologo.especialidad}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="servicio"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Tipo de tratamiento / Servicio
                  </label>

                  <select
                    id="servicio"
                    value={idServicio}
                    onChange={(e) =>
                      setIdServicio(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="">
                      Seleccionar servicio
                    </option>

                    {servicios.map(
                      (servicio) => (
                        <option
                          key={
                            servicio.idServicio
                          }
                          value={
                            servicio.idServicio
                          }
                        >
                          {servicio.nombre} — S/{" "}
                          {Number(
                            servicio.precio
                          ).toFixed(2)}
                        </option>
                      )
                    )}
                  </select>

                  {servicioSeleccionado && (
                    <p className="mt-2 text-xs text-gray-500">
                      Precio:{" "}
                      <strong>
                        S/{" "}
                        {Number(
                          servicioSeleccionado.precio
                        ).toFixed(2)}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-900">
                Datos del tratamiento
              </h3>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="fechaInicio"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Fecha de inicio
                  </label>

                  <input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) =>
                      setFechaInicio(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fechaFin"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Fecha de finalización
                  </label>

                  <input
                    id="fechaFin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) =>
                      setFechaFin(
                        e.target.value
                      )
                    }
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="estado"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Estado
                  </label>

                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) =>
                      setEstado(
                        e.target
                          .value as EstadoTratamiento
                      )
                    }
                    disabled={guardando}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                  >
                    <option value="PENDIENTE">
                      Pendiente
                    </option>

                    <option value="EN_PROCESO">
                      En proceso
                    </option>

                    <option value="FINALIZADO">
                      Finalizado
                    </option>

                    <option value="CANCELADO">
                      Cancelado
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Diagnóstico / Descripción
                </label>

                <textarea
                  id="descripcion"
                  rows={4}
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  placeholder="Describe el diagnóstico y tratamiento..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="observaciones"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Observaciones
                </label>

                <textarea
                  id="observaciones"
                  rows={4}
                  value={observaciones}
                  onChange={(e) =>
                    setObservaciones(
                      e.target.value
                    )
                  }
                  disabled={guardando}
                  placeholder="Agrega observaciones..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100"
                />
              </div>
            </section>

            {servicioSeleccionado && (
              <section className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Resumen del tratamiento
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-teal-600">
                      Paciente
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {historiaSeleccionada
                        ? obtenerNombrePaciente(
                            historiaSeleccionada
                          )
                        : "Sin seleccionar"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-teal-600">
                      Servicio
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {
                        servicioSeleccionado.nombre
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-teal-600">
                      Precio
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-900">
                      S/{" "}
                      {Number(
                        servicioSeleccionado.precio
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-6 sm:flex-row sm:justify-end">
            <Link
              to="/tratamientos"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? modoEdicion
                  ? "Actualizando tratamiento..."
                  : "Registrando tratamiento..."
                : modoEdicion
                  ? "Guardar cambios"
                  : "Registrar tratamiento"}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}