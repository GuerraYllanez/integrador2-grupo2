import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { mockSolicitudes } from "../../utils/mockData";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ScanLine,
  User,
  ImageIcon,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Textarea } from "../ui/textarea";

export function EvaluacionCrediticia() {
  const navigate = useNavigate();
  const [observaciones, setObservaciones] = useState("");

  const pacientesEvaluacion = mockSolicitudes.filter(s =>
    ["ED01", "ED02", "ED03"].includes(s.etapa)
  );

  // Odontograma simplificado — piezas dentales (adulto: 32 piezas)
  const cuadrantes = [
    { label: "Superior Derecho",   piezas: [18,17,16,15,14,13,12,11] },
    { label: "Superior Izquierdo", piezas: [21,22,23,24,25,26,27,28] },
    { label: "Inferior Derecho",   piezas: [48,47,46,45,44,43,42,41] },
    { label: "Inferior Izquierdo", piezas: [31,32,33,34,35,36,37,38] },
  ];
  const piezasAfectadas = [16, 25, 36, 47];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Evaluación Dental</h1>
          <p className="text-gray-500">ED01-ED03: Examen clínico, radiografías y evaluación especializada</p>
        </div>
      </div>

      <Tabs defaultValue="examen" className="space-y-6">
        <TabsList>
          <TabsTrigger value="examen">
            <ScanLine className="size-4 mr-2" />
            Examen Clínico (ED01)
          </TabsTrigger>
          <TabsTrigger value="radiografias">
            <ImageIcon className="size-4 mr-2" />
            Radiografías (ED02)
          </TabsTrigger>
          <TabsTrigger value="especialista">
            <User className="size-4 mr-2" />
            Especialista (ED03)
          </TabsTrigger>
          <TabsTrigger value="notas">
            <ClipboardList className="size-4 mr-2" />
            Notas Clínicas
          </TabsTrigger>
        </TabsList>

        {/* ED01: Examen Clínico / Odontograma */}
        <TabsContent value="examen" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Examen Clínico Dental — Odontograma</h2>
            <p className="text-gray-500 text-sm mb-6">Registro visual del estado de cada pieza dental del paciente</p>

            <div className="space-y-6">
              {pacientesEvaluacion.filter(s => s.etapa === "ED01").map((paciente) => (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-gray-900 font-medium mb-1">
                        {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      </div>
                      <div className="text-gray-500 text-sm font-mono">{paciente.numeroPaciente}</div>
                      <div className="text-gray-600 text-sm mt-1">Odontólogo: {paciente.medicoAsignado ?? "—"}</div>
                    </div>
                    <Badge variant="default" className="bg-teal-600">{paciente.especialidad ?? "Odontología General"}</Badge>
                  </div>

                  {/* Odontograma visual */}
                  <div className="mb-6">
                    <p className="text-gray-600 text-sm font-medium mb-3">Odontograma — piezas afectadas marcadas en rojo</p>
                    <div className="space-y-3">
                      {cuadrantes.map(c => (
                        <div key={c.label}>
                          <p className="text-gray-500 text-xs mb-1">{c.label}</p>
                          <div className="flex gap-1">
                            {c.piezas.map(p => (
                              <div
                                key={p}
                                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border ${
                                  piezasAfectadas.includes(p)
                                    ? "bg-red-100 border-red-400 text-red-700"
                                    : "bg-gray-50 border-gray-200 text-gray-500"
                                }`}
                              >
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-100 border border-red-400" /><span className="text-gray-600">Pieza afectada</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" /><span className="text-gray-600">Sana</span></div>
                    </div>
                  </div>

                  {/* Índices clínicos */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="size-4 text-teal-600" />
                        <span className="text-gray-600 text-sm">Índice de Placa</span>
                      </div>
                      <div className="text-gray-900 font-semibold">32%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="size-4 text-teal-600" />
                        <span className="text-gray-600 text-sm">Índice Gingival</span>
                      </div>
                      <div className="text-gray-900 font-semibold">Leve (1)</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="size-4 text-teal-600" />
                        <span className="text-gray-600 text-sm">Piezas con Caries</span>
                      </div>
                      <div className="text-gray-900 font-semibold">4 piezas</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="size-4 text-teal-600" />
                        <span className="text-gray-600 text-sm">Oclusión</span>
                      </div>
                      <div className="text-gray-900 font-semibold">Clase I — Normal</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">Registrar Odontograma</Button>
                    <Button size="sm" variant="outline">Solicitar Radiografías</Button>
                    <Button size="sm" variant="outline">Derivar Especialista</Button>
                  </div>
                </div>
              ))}

              {pacientesEvaluacion.filter(s => s.etapa === "ED01").length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay pacientes en examen clínico.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ED02: Radiografías */}
        <TabsContent value="radiografias" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Radiografías e Imágenes Diagnósticas</h2>
            <p className="text-gray-500 text-sm mb-6">Radiografías periapicales, panorámica dental y tomografía CBCT</p>

            <div className="space-y-6">
              {pacientesEvaluacion.filter(s => s.etapa === "ED02").map((paciente) => (
                <div key={paciente.id} className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                      <AlertCircle className="size-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium mb-1">
                        {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      </div>
                      <div className="text-gray-500 text-sm font-mono mb-2">{paciente.numeroPaciente}</div>
                      <Badge variant="outline">{paciente.especialidad ?? "Evaluación radiológica"}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {[
                      { tipo: "Radiografía Periapical (pieza 26)", estado: "completada", hallazgo: "Lesión periapical visible en raíz mesial" },
                      { tipo: "Radiografía Panorámica",            estado: "completada", hallazgo: "Tercer molares incluidos — evaluación recomendada" },
                      { tipo: "Tomografía CBCT",                   estado: "pendiente",  hallazgo: "—" },
                    ].map((rx, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${rx.estado === "completada" ? "bg-white border-blue-200" : "bg-yellow-50 border-yellow-200"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-900 text-sm font-medium">{rx.tipo}</span>
                          <Badge variant={rx.estado === "completada" ? "default" : "outline"} className={rx.estado === "completada" ? "bg-teal-600 text-xs" : "text-xs"}>
                            {rx.estado === "completada" ? "Completada" : "Pendiente"}
                          </Badge>
                        </div>
                        {rx.hallazgo !== "—" && (
                          <p className="text-gray-600 text-xs mt-1">Hallazgo: {rx.hallazgo}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className="text-gray-700 text-sm mb-2 block font-medium">Observaciones del radiólogo:</label>
                    <Textarea
                      value={observaciones}
                      onChange={e => setObservaciones(e.target.value)}
                      placeholder="Ingrese hallazgos radiológicos relevantes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">Guardar Hallazgos</Button>
                    <Button size="sm" variant="outline">Solicitar Tomografía CBCT</Button>
                  </div>
                </div>
              ))}

              {pacientesEvaluacion.filter(s => s.etapa === "ED02").length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay pacientes con radiografías pendientes.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ED03: Evaluación por Especialista */}
        <TabsContent value="especialista" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Interconsulta con Especialista</h2>
            <p className="text-gray-500 text-sm mb-6">Derivación a ortodoncia, endodoncia, periodoncia, cirugía oral u otras especialidades</p>

            <div className="space-y-6">
              {mockSolicitudes.slice(0, 3).map((paciente) => (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-gray-900 font-medium">
                      {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      <span className="text-gray-500 text-sm font-normal ml-3 font-mono">{paciente.numeroPaciente}</span>
                    </div>
                    <Badge variant="outline">{paciente.especialidad ?? "Especialidad pendiente"}</Badge>
                  </div>

                  {paciente.diagnostico && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg mb-4">
                      <p className="text-teal-900 text-sm">{paciente.diagnostico}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="text-gray-700 text-sm mb-2 block font-medium">Notas de interconsulta:</label>
                    <Textarea placeholder="Ingrese hallazgos del especialista..." rows={3} />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">Registrar Evaluación</Button>
                    <Button size="sm" variant="outline">Elaborar Plan de Tratamiento</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Notas Clínicas */}
        <TabsContent value="notas" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Notas y Evolución Clínica</h2>
            <p className="text-gray-500 text-sm mb-6">Registro de evolución por sesión de tratamiento</p>

            <div className="space-y-6">
              {mockSolicitudes.slice(0, 3).map((paciente) => (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-gray-900 font-medium">
                      {paciente.cliente.nombres} {paciente.cliente.apellidos}
                    </div>
                    <span className="text-gray-500 text-sm font-mono">{paciente.numeroPaciente}</span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="size-4 text-teal-600" />
                        <span className="text-teal-900 text-sm font-medium">
                          Sesión — {new Date(paciente.ultimaActualizacion).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                      <p className="text-teal-800 text-sm">
                        Paciente tolera bien el procedimiento. Anestesia local con lidocaína al 2%. Sin complicaciones intraoperatorias.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-gray-700 text-sm mb-2 block font-medium">Agregar nota de sesión:</label>
                    <Textarea placeholder="Ingrese evolución clínica de la sesión de hoy..." rows={3} />
                  </div>

                  <Button size="sm">Guardar Nota</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
