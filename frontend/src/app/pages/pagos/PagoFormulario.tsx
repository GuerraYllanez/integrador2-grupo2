import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  pagosApi,
  type EstadoPago,
  type MetodoPago,
  type PagoRequest,
} from "../../api/pagosApi";

import { apiFetch } from "../../api/client";

type Paciente = {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento?: string | null;
};

type Servicio = {
  idServicio: number;
  nombre: string;
  precio: number;
};

type Cita = {
  idCita: number;
  idPaciente: number;
  idServicio: number;
  fechaCita: string;
  horaCita: string;
};

export default function PagoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicion = Boolean(id);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);

  const [idPaciente, setIdPaciente] = useState("");
  const [idCita, setIdCita] = useState("");
  const [idServicio, setIdServicio] = useState("");

  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] =
    useState<MetodoPago>("EFECTIVO");

  const [estado, setEstado] =
    useState<EstadoPago>("PENDIENTE");

  const [referencia, setReferencia] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [pacientesData, serviciosData, citasData] =
          await Promise.all([
            apiFetch<Paciente[]>("/api/pacientes"),
            apiFetch<Servicio[]>("/api/servicios"),
            apiFetch<Cita[]>("/api/citas"),
          ]);

        setPacientes(pacientesData);
        setServicios(serviciosData);
        setCitas(citasData);

        if (modoEdicion && id) {
          const pago = await pagosApi.get(id);

          setIdPaciente(String(pago.idPaciente));

          setIdCita(
            pago.idCita !== null
              ? String(pago.idCita)
              : ""
          );

          setIdServicio(String(pago.idServicio));
          setMonto(String(pago.monto));
          setMetodoPago(pago.metodoPago);
          setEstado(pago.estado);

          setReferencia(
            pago.referencia || ""
          );

          setObservaciones(
            pago.observaciones || ""
          );
        }
      } catch (err) {
        const mensaje =
          err instanceof Error
            ? err.message
            : "No se pudo cargar la información del pago.";

        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id, modoEdicion]);

  const citasFiltradas = idPaciente
    ? citas.filter(
        (cita) =>
          cita.idPaciente === Number(idPaciente)
      )
    : citas;

  const servicioSeleccionado = servicios.find(
    (servicio) =>
      servicio.idServicio === Number(idServicio)
  );

  const cambiarServicio = (valor: string) => {
    setIdServicio(valor);

    const servicio = servicios.find(
      (item) => item.idServicio === Number(valor)
    );

    if (servicio && !modoEdicion) {
      setMonto(String(servicio.precio));
    }
  };

  const cambiarPaciente = (valor: string) => {
    setIdPaciente(valor);
    setIdCita("");
  };

  const guardar = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    if (!idPaciente) {
      setError("Debe seleccionar un paciente.");
      return;
    }

    if (!idServicio) {
      setError("Debe seleccionar un servicio.");
      return;
    }

    if (!monto || Number(monto) <= 0) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    try {
      setGuardando(true);

      const datos: PagoRequest = {
        idPaciente: Number(idPaciente),
        idCita: idCita
          ? Number(idCita)
          : null,
        idServicio: Number(idServicio),
        monto: Number(monto),
        metodoPago,
        estado,
        referencia:
          referencia.trim() || undefined,
        observaciones:
          observaciones.trim() || undefined,
      };

      if (modoEdicion && id) {
        await pagosApi.update(id, datos);
      } else {
        await pagosApi.create(datos);
      }

      navigate("/pagos");
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo guardar el pago.";

      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-500">
        Cargando información...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {modoEdicion
            ? "Editar pago"
            : "Nuevo pago"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {modoEdicion
            ? "Modifique la información del pago registrado."
            : "Registre un nuevo pago de un servicio odontológico."}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={guardar}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="grid gap-6 p-6 md:grid-cols-2">

          <div>
            <label
              htmlFor="paciente"
              className="block text-sm font-medium text-gray-700"
            >
              Paciente
            </label>

            <select
              id="paciente"
              value={idPaciente}
              onChange={(event) =>
                cambiarPaciente(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            >
              <option value="">
                Seleccione un paciente
              </option>

              {pacientes.map((paciente) => (
                <option
                  key={paciente.idPaciente}
                  value={paciente.idPaciente}
                >
                  {paciente.nombres} {paciente.apellidos}
                  {paciente.documento
                    ? ` - ${paciente.documento}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="cita"
              className="block text-sm font-medium text-gray-700"
            >
              Cita
            </label>

            <select
              id="cita"
              value={idCita}
              onChange={(event) =>
                setIdCita(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="">
                Sin cita asociada
              </option>

              {citasFiltradas.map((cita) => (
                <option
                  key={cita.idCita}
                  value={cita.idCita}
                >
                  Cita #{cita.idCita} -{" "}
                  {cita.fechaCita}{" "}
                  {cita.horaCita}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="servicio"
              className="block text-sm font-medium text-gray-700"
            >
              Servicio
            </label>

            <select
              id="servicio"
              value={idServicio}
              onChange={(event) =>
                cambiarServicio(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            >
              <option value="">
                Seleccione un servicio
              </option>

              {servicios.map((servicio) => (
                <option
                  key={servicio.idServicio}
                  value={servicio.idServicio}
                >
                  {servicio.nombre} - S/{" "}
                  {Number(servicio.precio).toFixed(2)}
                </option>
              ))}
            </select>

            {servicioSeleccionado && (
              <p className="mt-1 text-xs text-gray-500">
                Precio del servicio: S/{" "}
                {Number(
                  servicioSeleccionado.precio
                ).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monto"
              className="block text-sm font-medium text-gray-700"
            >
              Monto
            </label>

            <input
              id="monto"
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(event) =>
                setMonto(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="metodoPago"
              className="block text-sm font-medium text-gray-700"
            >
              Método de pago
            </label>

            <select
              id="metodoPago"
              value={metodoPago}
              onChange={(event) =>
                setMetodoPago(
                  event.target.value as MetodoPago
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            >
              <option value="EFECTIVO">
                EFECTIVO
              </option>

              <option value="TARJETA">
                TARJETA
              </option>

              <option value="YAPE">
                YAPE
              </option>

              <option value="PLIN">
                PLIN
              </option>

              <option value="TRANSFERENCIA">
                TRANSFERENCIA
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-700"
            >
              Estado
            </label>

            <select
              id="estado"
              value={estado}
              onChange={(event) =>
                setEstado(
                  event.target.value as EstadoPago
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              required
            >
              <option value="PENDIENTE">
                PENDIENTE
              </option>

              <option value="PAGADO">
                PAGADO
              </option>

              <option value="ANULADO">
                ANULADO
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="referencia"
              className="block text-sm font-medium text-gray-700"
            >
              Referencia
            </label>

            <input
              id="referencia"
              type="text"
              value={referencia}
              onChange={(event) =>
                setReferencia(event.target.value)
              }
              maxLength={100}
              placeholder="Número de operación o referencia"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="observaciones"
              className="block text-sm font-medium text-gray-700"
            >
              Observaciones
            </label>

            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(event) =>
                setObservaciones(event.target.value)
              }
              maxLength={255}
              rows={4}
              placeholder="Observaciones del pago"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/pagos")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
                ? "Guardar cambios"
                : "Registrar pago"}
          </button>
        </div>
      </form>
    </div>
  );
}