import { useEffect, useState } from "react";
import { Link } from "react-router";
import { historiasApi } from "../../api/historiasApi";

type Paciente = {
  idPaciente?: number;
  nombres?: string;
  apellidos?: string;
  documento?: string;
};

type HistoriaClinicaData = {
  idHistoria?: number;
  codigoHistoria?: string;
  antecedentes?: string;
  alergias?: string;
  observaciones?: string;
  paciente?: Paciente;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export default function HistoriaClinica() {
  const [historias, setHistorias] = useState<HistoriaClinicaData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const cargarHistorias = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await historiasApi.list();

      setHistorias(data as HistoriaClinicaData[]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las historias clínicas."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorias();
  }, []);

  const eliminarHistoria = async (id: number) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar esta historia clínica? Esta acción no se puede deshacer."
    );

    if (!confirmar) {
      return;
    }

    try {
      setEliminandoId(id);
      setError("");

      await historiasApi.delete(id);

      setHistorias((actuales) =>
        actuales.filter((historia) => historia.idHistoria !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la historia clínica."
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Historia clínica
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Historia odontológica y registro de atenciones del paciente.
          </p>
        </div>

        <Link
          to="/historias/nueva"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nueva historia
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">
            No se pudo completar la operación.
          </p>

          <p className="mt-1">{error}</p>

          <button
            type="button"
            onClick={cargarHistorias}
            className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {cargando && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Cargando historias clínicas...
          </p>
        </div>
      )}

      {!cargando && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Código
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Paciente
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Documento
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Antecedentes
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Alergias
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {historias.map((historia) => {
                  const paciente = historia.paciente;

                  return (
                    <tr
                      key={historia.idHistoria}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {historia.idHistoria}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900">
                        {historia.codigoHistoria || "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {paciente
                          ? `${paciente.nombres ?? ""} ${
                              paciente.apellidos ?? ""
                            }`.trim()
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {paciente?.documento || "-"}
                      </td>

                      <td className="max-w-xs px-4 py-3 text-gray-600">
                        <span className="line-clamp-2">
                          {historia.antecedentes || "-"}
                        </span>
                      </td>

                      <td className="max-w-xs px-4 py-3 text-gray-600">
                        <span className="line-clamp-2">
                          {historia.alergias || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {historia.idHistoria && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/historias/${historia.idHistoria}`}
                              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                              Ver
                            </Link>

                            <Link
                              to={`/historias/${historia.idHistoria}/editar`}
                              className="rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                            >
                              Editar
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                eliminarHistoria(historia.idHistoria!)
                              }
                              disabled={
                                eliminandoId === historia.idHistoria
                              }
                              className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {eliminandoId === historia.idHistoria
                                ? "Eliminando..."
                                : "Eliminar"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {historias.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No existen historias clínicas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}