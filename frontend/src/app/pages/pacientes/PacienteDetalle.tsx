import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { pacientesApi } from "../../api/pacientesApi";

type Paciente = {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  sexo?: string;
  estado?: boolean;
  fechaRegistro?: string;
};

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No se encontró el identificador del paciente.");
      setCargando(false);
      return;
    }

    cargarPaciente(id);
  }, [id]);

  async function cargarPaciente(idPaciente: string) {
    try {
      setCargando(true);
      setError("");

      const data = await pacientesApi.get(idPaciente);

      setPaciente(data as Paciente);
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

  if (cargando) {
    return (
      <div className="p-6">
        <p>Cargando información del paciente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Volver a pacientes
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-6">
        <p>No se encontró el paciente.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ENCABEZADO */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Volver a pacientes
        </button>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {paciente.nombres} {paciente.apellidos}
            </h1>

            <p className="mt-1 text-gray-600">
              Información personal del paciente
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
              paciente.estado
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {paciente.estado ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      {/* INFORMACIÓN PERSONAL */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">
          Datos personales
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">ID del paciente</p>
            <p className="mt-1 font-medium">
              {paciente.idPaciente}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Documento</p>
            <p className="mt-1 font-medium">
              {paciente.documento}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Nombres</p>
            <p className="mt-1 font-medium">
              {paciente.nombres}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Apellidos</p>
            <p className="mt-1 font-medium">
              {paciente.apellidos}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Fecha de nacimiento
            </p>
            <p className="mt-1 font-medium">
              {paciente.fechaNacimiento || "No registrada"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Sexo</p>
            <p className="mt-1 font-medium">
              {paciente.sexo || "No registrado"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="mt-1 font-medium">
              {paciente.telefono || "No registrado"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Correo electrónico</p>
            <p className="mt-1 font-medium">
              {paciente.correo || "No registrado"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Dirección</p>
            <p className="mt-1 font-medium">
              {paciente.direccion || "No registrada"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Fecha de registro</p>
            <p className="mt-1 font-medium">
              {paciente.fechaRegistro || "No disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/pacientes")}
          className="rounded-lg border px-5 py-2 font-medium hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    </div>
  );
}