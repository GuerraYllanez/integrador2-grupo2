import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  pagosApi,
  type PagoResponse,
} from "../../api/pagosApi";

export default function Pagos() {
  const navigate = useNavigate();

  const [pagos, setPagos] = useState<PagoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPagos = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await pagosApi.list();

      setPagos(data);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los pagos.";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const eliminarPago = async (id: number) => {
    const confirmar = window.confirm(
      "¿Está seguro de eliminar este pago?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await pagosApi.delete(id);

      setPagos((actuales) =>
        actuales.filter(
          (pago) => pago.idPago !== id
        )
      );
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el pago.";

      setError(mensaje);
    }
  };

  const formatearFecha = (
    fecha: string | null
  ) => {
    if (!fecha) {
      return "-";
    }

    const fechaLocal = new Date(fecha);

    if (Number.isNaN(fechaLocal.getTime())) {
      return fecha;
    }

    return fechaLocal.toLocaleString("es-PE");
  };

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(monto);
  };

  const obtenerClaseEstado = (
    estado: PagoResponse["estado"]
  ) => {
    if (estado === "PAGADO") {
      return "bg-green-100 text-green-700";
    }

    if (estado === "ANULADO") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Pagos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Registro y consulta de pagos de servicios odontológicos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/pagos/nuevo")}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Nuevo pago
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Cargando pagos...
          </div>
        ) : pagos.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No existen pagos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    ID
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Paciente
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Servicio
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Monto
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Método
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Estado
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Fecha
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {pagos.map((pago) => (
                  <tr
                    key={pago.idPago}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{pago.idPago}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {pago.paciente}
                      </div>

                      <div className="text-xs text-gray-500">
                        {pago.documentoPaciente || "Sin documento"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {pago.servicio}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {formatearMonto(pago.monto)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {pago.metodoPago}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${obtenerClaseEstado(
                          pago.estado
                        )}`}
                      >
                        {pago.estado}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatearFecha(pago.fechaPago)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/pagos/${pago.idPago}`
                            )
                          }
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/pagos/${pago.idPago}/editar`
                            )
                          }
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarPago(pago.idPago)
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}