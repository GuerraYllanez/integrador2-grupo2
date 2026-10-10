import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { apiFetch } from "../../api/client";

type PacienteRequest = {
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  correo: string;
  fechaNacimiento: string;
  direccion: string;
  sexo: string;
};

type Paciente = {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono?: string;
  correo?: string;
  fechaNacimiento?: string;
  direccion?: string;
  sexo?: string;
};

const formularioInicial: PacienteRequest = {
  nombres: "",
  apellidos: "",
  documento: "",
  telefono: "",
  correo: "",
  fechaNacimiento: "",
  direccion: "",
  sexo: "",
};

export default function PacienteFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicion = Boolean(id);

  const [formulario, setFormulario] =
    useState<PacienteRequest>(formularioInicial);

  const [cargando, setCargando] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // ============================================================
  // CARGAR PACIENTE PARA EDITAR
  // ============================================================

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }

    cargarPaciente(id);
  }, [id]);

  async function cargarPaciente(idPaciente: string) {
    try {
      setCargando(true);
      setError("");

      const paciente = await apiFetch<Paciente>(
        `/api/pacientes/${idPaciente}`
      );

      setFormulario({
        nombres: paciente.nombres || "",
        apellidos: paciente.apellidos || "",
        documento: paciente.documento || "",
        telefono: paciente.telefono || "",
        correo: paciente.correo || "",
        fechaNacimiento: paciente.fechaNacimiento || "",
        direccion: paciente.direccion || "",
        sexo: paciente.sexo || "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la información del paciente."
      );
    } finally {
      setCargando(false);
    }
  }

  // ============================================================
  // CAMBIAR CAMPOS
  // ============================================================

  function cambiarCampo(
    campo: keyof PacienteRequest,
    valor: string
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  // ============================================================
  // GUARDAR
  // ============================================================

  async function guardarPaciente(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setExito("");

    // Validaciones
    if (!formulario.nombres.trim()) {
      setError("Ingrese los nombres del paciente.");
      return;
    }

    if (!formulario.apellidos.trim()) {
      setError("Ingrese los apellidos del paciente.");
      return;
    }

    if (!formulario.documento.trim()) {
      setError("Ingrese el documento del paciente.");
      return;
    }

    if (!formulario.sexo) {
      setError("Seleccione el sexo del paciente.");
      return;
    }

    try {
      setGuardando(true);

      const datos = {
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        documento: formulario.documento.trim(),
        telefono: formulario.telefono.trim(),
        correo: formulario.correo.trim(),
        fechaNacimiento:
          formulario.fechaNacimiento || null,
        direccion: formulario.direccion.trim(),
        sexo: formulario.sexo,
      };

      if (modoEdicion && id) {
        // ======================================================
        // EDITAR
        // ======================================================

        await apiFetch(`/api/pacientes/${id}`, {
          method: "PUT",
          body: JSON.stringify(datos),
        });

        setExito("Paciente actualizado correctamente.");

        setTimeout(() => {
          navigate(`/pacientes/${id}`);
        }, 800);
      } else {
        // ======================================================
        // CREAR
        // ======================================================

        await apiFetch("/api/pacientes", {
          method: "POST",
          body: JSON.stringify(datos),
        });

        setExito("Paciente registrado correctamente.");

        setTimeout(() => {
          navigate("/pacientes");
        }, 800);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : modoEdicion
            ? "No se pudo actualizar el paciente."
            : "No se pudo registrar el paciente."
      );
    } finally {
      setGuardando(false);
    }
  }

  // ============================================================
  // CARGANDO
  // ============================================================

  if (cargando) {
    return (
      <div className="p-6">
        <p>Cargando información del paciente...</p>
      </div>
    );
  }

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <div className="p-6">

      {/* CABECERA */}
      <div className="mb-6">

        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Volver a pacientes
        </button>

        <h1 className="text-2xl font-bold">
          {modoEdicion
            ? "Editar paciente"
            : "Nuevo paciente"}
        </h1>

        <p className="mt-2 text-gray-600">
          {modoEdicion
            ? "Actualice los datos personales del paciente."
            : "Registre los datos personales del paciente."}
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* ÉXITO */}
      {exito && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {exito}
        </div>
      )}

      {/* FORMULARIO */}
      <form
        onSubmit={guardarPaciente}
        className="max-w-4xl rounded-xl border bg-white p-6 shadow-sm"
      >

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* NOMBRES */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombres
            </label>

            <input
              type="text"
              value={formulario.nombres}
              onChange={(e) =>
                cambiarCampo("nombres", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* APELLIDOS */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Apellidos
            </label>

            <input
              type="text"
              value={formulario.apellidos}
              onChange={(e) =>
                cambiarCampo("apellidos", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* DOCUMENTO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Documento
            </label>

            <input
              type="text"
              value={formulario.documento}
              onChange={(e) =>
                cambiarCampo("documento", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* FECHA DE NACIMIENTO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fecha de nacimiento
            </label>

            <input
              type="date"
              value={formulario.fechaNacimiento}
              onChange={(e) =>
                cambiarCampo(
                  "fechaNacimiento",
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* TELÉFONO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Teléfono
            </label>

            <input
              type="text"
              value={formulario.telefono}
              onChange={(e) =>
                cambiarCampo("telefono", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* CORREO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>

            <input
              type="email"
              value={formulario.correo}
              onChange={(e) =>
                cambiarCampo("correo", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* SEXO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sexo
            </label>

            <select
              value={formulario.sexo}
              onChange={(e) =>
                cambiarCampo("sexo", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
              required
            >
              <option value="">
                Seleccione una opción
              </option>

              <option value="MASCULINO">
                Masculino
              </option>

              <option value="FEMENINO">
                Femenino
              </option>

              <option value="OTRO">
                Otro
              </option>
            </select>
          </div>

          {/* DIRECCIÓN */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Dirección
            </label>

            <input
              type="text"
              value={formulario.direccion}
              onChange={(e) =>
                cambiarCampo("direccion", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* BOTONES */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate("/pacientes")}
            className="rounded-lg border px-5 py-2 font-medium hover:bg-gray-50"
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
                ? "Actualizar paciente"
                : "Guardar paciente"}
          </button>

        </div>

      </form>
    </div>
  );
}