import { useParams, useNavigate } from "react-router";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { mockSolicitudes, estados, etapas, tiposPaciente } from "../../utils/mockData";
import {
  ArrowLeft,
  User,
  FileText,
  ScanLine,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  SmilePlus,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export function DetalleSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();

  const paciente = mockSolicitudes.find(s => s.id === id);

  if (!paciente) {
    return (
      <div className="text-center py-12">
        <h2>Paciente no encontrado</h2>
        <Button onClick={() => navigate("/")} className="mt-4">Volver al Panel</Button>
      </div>
    );
  }

  const estadoInfo = estados[paciente.estado as keyof typeof estados];
  const etapaInfo = etapas.find(e => e.codigo === paciente.etapa);
  const tipoPacienteInfo = tiposPaciente[paciente.tipoPaciente as keyof typeof tiposPaciente];

  const getEstadoBadgeColor = (estado: string): "default" | "secondary" | "destructive" | "outline" => {
    const info = estados[estado as keyof typeof estados];
    if (!info) return "default";
    const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      blue: "default", yellow: "outline", purple: "secondary",
      orange: "outline", green: "default", red: "destructive", cyan: "secondary",
    };
    return colorMap[info.color] || "default";
  };

  const edad = new Date().getFullYear() - new Date(paciente.cliente.fechaNacimiento).getFullYear();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1>Detalle del Paciente</h1>
          <p className="text-gray-500 font-mono text-sm">{paciente.numeroPaciente}</p>
        </div>
        <Badge variant={getEstadoBadgeColor(paciente.estado)}>
          {estadoInfo?.label ?? paciente.estado}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Paciente */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="size-5 text-teal-600" />
              <h2>Información del Paciente</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Nombre Completo</span>
                <span className="text-gray-900 font-medium">
                  {paciente.cliente.nombres} {paciente.cliente.apellidos}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Documento</span>
                <span className="text-gray-900">
                  {paciente.cliente.tipoDocumento}: {paciente.cliente.numeroDocumento}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Fecha de Nacimiento</span>
                <span className="text-gray-900">
                  {new Date(paciente.cliente.fechaNacimiento).toLocaleDateString("es-PE")} ({edad} años)
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Última Visita Dental</span>
                <span className="text-gray-900">
                  {paciente.cliente.ultimaVisitaDental
                    ? new Date(paciente.cliente.ultimaVisitaDental).toLocaleDateString("es-PE")
                    : "Sin registro previo"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Nacionalidad</span>
                <span className="text-gray-900">{paciente.cliente.nacionalidad}</span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Tipo de Cobertura</span>
                {tipoPacienteInfo ? (
                  <Badge variant="outline">{tipoPacienteInfo.label}</Badge>
                ) : (
                  <span className="text-gray-500 text-sm">No definido</span>
                )}
              </div>

              <div className="col-span-2 pt-4 border-t border-gray-200">
                <h3 className="mb-4">Datos de Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-gray-400" />
                    <span className="text-gray-900">{paciente.cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-gray-400" />
                    <span className="text-gray-900">{paciente.cliente.telefono}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 text-gray-400" />
                    <span className="text-gray-900">Lima, Perú</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Información Dental */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ScanLine className="size-5 text-teal-600" />
              <h2>Información Dental</h2>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-center">
                <div className="text-teal-600 text-sm mb-1">Odontólogo Tratante</div>
                <div className="text-teal-900 font-medium text-sm">{paciente.medicoAsignado ?? "Sin asignar"}</div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-blue-600 text-sm mb-1">Especialidad</div>
                <div className="text-blue-900 font-medium text-sm">{paciente.especialidad ?? "—"}</div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <div className="text-purple-600 text-sm mb-1">Etapa Actual</div>
                <div className="text-purple-900 font-medium text-sm">{paciente.etapa}</div>
              </div>
            </div>

            {paciente.diagnostico && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-green-900 text-sm font-medium mb-1">Diagnóstico Dental:</p>
                <p className="text-green-800 text-sm">{paciente.diagnostico}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 text-sm">Fecha de Registro</span>
                <span className="text-gray-900 text-sm">{new Date(paciente.fechaCreacion).toLocaleDateString("es-PE")}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 text-sm">Última Actualización</span>
                <span className="text-gray-900 text-sm">{new Date(paciente.ultimaActualizacion).toLocaleDateString("es-PE")}</span>
              </div>
              {tipoPacienteInfo && (
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm">Cobertura</span>
                  <span className="text-gray-900 text-sm">{tipoPacienteInfo.descripcion}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Documentación */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="size-5 text-teal-600" />
              <h2>Documentación</h2>
            </div>

            <div className="space-y-3">
              {[
                { nombre: "Documento de Identidad",        estado: "VALIDADO"  },
                { nombre: "Tarjeta de Seguro / EPS",       estado: "VALIDADO"  },
                { nombre: "Radiografías Panorámicas",      estado: "VALIDADO"  },
                { nombre: "Consentimiento Informado",      estado: "PENDIENTE" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 text-sm">{doc.nombre}</span>
                  <Badge
                    variant={doc.estado === "VALIDADO" ? "default" : "outline"}
                    className={doc.estado === "VALIDADO" ? "bg-green-600" : ""}
                  >
                    {doc.estado === "VALIDADO"
                      ? <><CheckCircle2 className="size-3 mr-1" />Validado</>
                      : <><Clock className="size-3 mr-1" />Pendiente</>
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Estado y Etapa */}
          <Card className="p-6">
            <h3 className="mb-4">Estado Actual</h3>
            <div className="space-y-4">
              <div>
                <span className="text-gray-500 text-sm block mb-2">Etapa</span>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="text-teal-900 font-mono text-sm">{paciente.etapa}</div>
                  <div className="text-teal-700 text-sm">{etapaInfo?.nombre}</div>
                  <div className="text-teal-600 text-xs mt-1">{etapaInfo?.descripcion}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-2">Estado</span>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <Badge variant={getEstadoBadgeColor(paciente.estado)}>
                    {estadoInfo?.label ?? paciente.estado}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Historial */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-gray-600" />
              <h3>Historial de Atención</h3>
            </div>

            <div className="space-y-4">
              {[
                { fecha: new Date(paciente.ultimaActualizacion).toLocaleDateString("es-PE"), evento: "Última actualización",        etapa: paciente.etapa },
                { fecha: "22/11/2025",  evento: "Evaluación dental completada",  etapa: "ED01" },
                { fecha: "21/11/2025",  evento: "Documentos validados",           etapa: "V01"  },
                { fecha: new Date(paciente.fechaCreacion).toLocaleDateString("es-PE"), evento: "Paciente registrado",    etapa: "R01"  },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`size-2 rounded-full ${i === 0 ? "bg-teal-600" : "bg-gray-300"}`} />
                    {i < 3 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="text-gray-900 text-sm mb-1">{item.evento}</div>
                    <div className="text-gray-500 text-sm">{item.fecha}</div>
                    <Badge variant="outline" className="mt-2 text-xs">{item.etapa}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tratamiento completado */}
          {paciente.estado === "TRATAMIENTO_COMPLETADO" && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <SmilePlus className="size-5 text-green-600" />
                <h3 className="text-green-900">Tratamiento Completado</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-800 text-sm">Diagnóstico</span>
                  <span className="text-green-900 text-sm font-medium text-right max-w-[60%]">{paciente.diagnostico ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 text-sm">Odontólogo</span>
                  <span className="text-green-900 text-sm">{paciente.medicoAsignado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 text-sm">Control</span>
                  <span className="text-green-900 text-sm">3 meses</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Calendar className="size-4 mr-2" />
                Programar Control
              </Button>
            </Card>
          )}

          {/* Urgencia */}
          {paciente.estado === "URGENCIA_DENTAL" && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-5 text-red-600" />
                <h3 className="text-red-900">Urgencia Dental</h3>
              </div>
              <p className="text-red-800 text-sm mb-4">
                {paciente.diagnostico ?? "Paciente en atención de urgencia dental."}
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700">Ver en Urgencias</Button>
            </Card>
          )}

          {/* Acciones */}
          <Card className="p-6">
            <h3 className="mb-4">Acciones</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">Descargar Historia Dental</Button>
              <Button variant="outline" className="w-full">Enviar Recordatorio de Cita</Button>
              <Button variant="outline" className="w-full">Programar Próxima Sesión</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
