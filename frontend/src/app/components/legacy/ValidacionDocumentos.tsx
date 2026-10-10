import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { mockSolicitudes } from "../../utils/mockData";
import { useNavigate } from "react-router";
import { ArrowLeft, FileCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

const documentosTipo = [
  { id: "dni",              nombre: "Documento de Identidad (DNI / CE / Pasaporte)", requerido: true  },
  { id: "seguro",           nombre: "Tarjeta EPS / Seguro Dental",                   requerido: true  },
  { id: "historia",         nombre: "Radiografías Previas (si aplica)",               requerido: false },
  { id: "consentimiento",   nombre: "Consentimiento Informado Dental firmado",        requerido: true  },
];

const estadosFijos: Record<string, Record<string, string>> = {
  "1": { dni: "VALIDO",    seguro: "PENDIENTE", historia: "VALIDO",    consentimiento: "PENDIENTE" },
  "2": { dni: "VALIDO",    seguro: "VALIDO",    historia: "PENDIENTE", consentimiento: "VALIDO"   },
  "3": { dni: "VALIDO",    seguro: "VALIDO",    historia: "VALIDO",    consentimiento: "VALIDO"   },
};

export function ValidacionDocumentos() {
  const navigate = useNavigate();
  const [expandidos, setExpandidos] = useState<string[]>([]);

  const toggle = (key: string) =>
    setExpandidos(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const pacientesValidacion = mockSolicitudes.slice(0, 3);

  const validos   = pacientesValidacion.reduce((acc, p) => acc + Object.values(estadosFijos[p.id] ?? {}).filter(v => v === "VALIDO").length, 0);
  const pendientes= pacientesValidacion.reduce((acc, p) => acc + Object.values(estadosFijos[p.id] ?? {}).filter(v => v === "PENDIENTE").length, 0);
  const rechazados= pacientesValidacion.reduce((acc, p) => acc + Object.values(estadosFijos[p.id] ?? {}).filter(v => v === "RECHAZADO").length, 0);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Validación de Documentos</h1>
          <p className="text-gray-500">V01-V02: Revisión de DNI, cobertura dental, radiografías y consentimiento informado</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 text-green-600 p-3 rounded-lg"><CheckCircle2 className="size-6" /></div>
            <div>
              <p className="text-gray-500 text-sm">Documentos Válidos</p>
              <p className="text-gray-900 text-2xl font-bold">{validos}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg"><Clock className="size-6" /></div>
            <div>
              <p className="text-gray-500 text-sm">En Revisión</p>
              <p className="text-gray-900 text-2xl font-bold">{pendientes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 text-red-600 p-3 rounded-lg"><XCircle className="size-6" /></div>
            <div>
              <p className="text-gray-500 text-sm">Rechazados</p>
              <p className="text-gray-900 text-2xl font-bold">{rechazados}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pacientes en validación */}
      <div className="space-y-6">
        {pacientesValidacion.map((paciente) => {
          const docs = estadosFijos[paciente.id] ?? {};
          return (
            <Card key={paciente.id} className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-gray-900 font-medium mb-1">
                    {paciente.cliente.nombres} {paciente.cliente.apellidos}
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span className="font-mono">{paciente.numeroPaciente}</span>
                    <span>·</span>
                    <span>{paciente.cliente.tipoDocumento}: {paciente.cliente.numeroDocumento}</span>
                  </div>
                </div>
                <Badge variant="outline">En Revisión</Badge>
              </div>

              <div className="space-y-3">
                {documentosTipo.map((doc) => {
                  const estado = docs[doc.id] ?? "PENDIENTE";
                  const expandido = expandidos.includes(`${paciente.id}-${doc.id}`);
                  return (
                    <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggle(`${paciente.id}-${doc.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck className="size-5 text-gray-400" />
                          <div>
                            <div className="text-gray-900 text-sm">{doc.nombre}</div>
                            {doc.requerido && <span className="text-gray-500 text-xs">Obligatorio</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {estado === "VALIDO" && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="size-3 mr-1" />Válido
                            </Badge>
                          )}
                          {estado === "PENDIENTE" && (
                            <Badge variant="outline">
                              <Clock className="size-3 mr-1" />Pendiente
                            </Badge>
                          )}
                          {estado === "RECHAZADO" && (
                            <Badge variant="destructive">
                              <XCircle className="size-3 mr-1" />Rechazado
                            </Badge>
                          )}
                        </div>
                      </div>

                      {expandido && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <div className="mb-4">
                            <p className="text-gray-600 text-sm mb-2 font-medium">Criterios de Validación:</p>
                            <ul className="text-gray-700 text-sm space-y-1">
                              <li>✓ Autenticidad del documento</li>
                              <li>✓ Vigencia actualizada</li>
                              <li>✓ Datos legibles y completos</li>
                              <li>✓ Coincidencia con datos registrados del paciente</li>
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Aprobar</Button>
                            <Button size="sm" variant="outline">Rechazar</Button>
                            <Button size="sm" variant="ghost">Solicitar Corrección</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <Button className="flex-1">Validar Todos los Documentos</Button>
                <Button variant="outline">Solicitar Documentos Faltantes</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
