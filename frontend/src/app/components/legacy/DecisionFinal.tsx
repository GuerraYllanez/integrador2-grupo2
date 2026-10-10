import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { mockSolicitudes } from "../../utils/mockData";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  Mail,
  MessageSquare,
  Send,
  Pill,
  DollarSign,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const procedimientos = [
  { nombre: "Resina compuesta",           precio: 80,  sesiones: 1 },
  { nombre: "Endodoncia molar",           precio: 350, sesiones: 3 },
  { nombre: "Exodoncia simple",           precio: 120, sesiones: 1 },
  { nombre: "Profilaxis dental",          precio: 60,  sesiones: 1 },
  { nombre: "Blanqueamiento dental",      precio: 280, sesiones: 2 },
  { nombre: "Aparato de ortodoncia",      precio: 2800,sesiones: 24 },
  { nombre: "Implante dental (unitario)", precio: 2200,sesiones: 4 },
];

export function DecisionFinal() {
  const navigate = useNavigate();
  const [notaClinica, setNotaClinica] = useState("");
  const [canalNotificacion, setCanalNotificacion] = useState("email");

  const pacientesDecision = mockSolicitudes.filter(s =>
    ["PT01", "PT02", "T01"].includes(s.etapa) || s.estado === "TRATAMIENTO_COMPLETADO"
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Plan de Tratamiento</h1>
          <p className="text-gray-500">PT01-PT02: Elaboración, presupuesto y aprobación del plan de tratamiento dental</p>
        </div>
      </div>

      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plan">
            <ClipboardList className="size-4 mr-2" />
            Elaborar Plan (PT01)
          </TabsTrigger>
          <TabsTrigger value="aprobacion">
            <CheckCircle className="size-4 mr-2" />
            Aprobación (PT02)
          </TabsTrigger>
          <TabsTrigger value="notificacion">
            <Pill className="size-4 mr-2" />
            Indicaciones (D03)
          </TabsTrigger>
        </TabsList>

        {/* PT01: Elaborar Plan de Tratamiento */}
        <TabsContent value="plan" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Plan de Tratamiento Dental</h2>
            <p className="text-gray-500 text-sm mb-6">
              Listado de procedimientos, sesiones estimadas y presupuesto total
            </p>

            <div className="space-y-6">
              {mockSolicitudes.slice(0, 3).map((paciente) => (
                <div key={paciente.id} className="border-2 border-teal-200 bg-teal-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-gray-900 font-medium mb-1">
                        {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      </div>
                      <div className="text-gray-500 text-sm font-mono mb-2">{paciente.numeroPaciente}</div>
                      <Badge variant="outline">{paciente.especialidad ?? "Odontología General"}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-sm">Odontólogo</div>
                      <div className="text-gray-900 text-sm">{paciente.medicoAsignado ?? "—"}</div>
                    </div>
                  </div>

                  {paciente.diagnostico && (
                    <div className="p-3 bg-white border border-teal-200 rounded-lg mb-4">
                      <p className="text-teal-900 text-sm font-medium mb-1">Diagnóstico:</p>
                      <p className="text-teal-800 text-sm">{paciente.diagnostico}</p>
                    </div>
                  )}

                  {/* Tabla de procedimientos */}
                  <div className="bg-white border border-teal-200 rounded-lg mb-4 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-teal-50 border-b border-teal-200">
                          <th className="text-left py-2 px-4 text-teal-800 font-medium">Procedimiento</th>
                          <th className="text-center py-2 px-4 text-teal-800 font-medium">Sesiones</th>
                          <th className="text-right py-2 px-4 text-teal-800 font-medium">Precio (S/)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {procedimientos.slice(0, 3).map((proc, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="py-2.5 px-4 text-gray-800">{proc.nombre}</td>
                            <td className="py-2.5 px-4 text-center text-gray-600">{proc.sesiones}</td>
                            <td className="py-2.5 px-4 text-right text-gray-900 font-medium">S/ {proc.precio.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-900" colSpan={2}>Total del Plan</td>
                          <td className="py-3 px-4 text-right font-bold text-teal-700">
                            S/ {procedimientos.slice(0, 3).reduce((s, p) => s + p.precio, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-4">
                    <label className="text-gray-700 text-sm mb-2 block font-medium">Observaciones del plan:</label>
                    <Textarea
                      value={notaClinica}
                      onChange={e => setNotaClinica(e.target.value)}
                      placeholder="Indicaciones adicionales, prioridad de tratamientos..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">Enviar para Aprobación</Button>
                    <Button size="sm" variant="outline">Modificar Plan</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* PT02: Aprobación del Plan */}
        <TabsContent value="aprobacion" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Aprobación del Plan por el Paciente</h2>
            <p className="text-gray-500 text-sm mb-6">
              El paciente revisa y firma la aceptación del plan de tratamiento y presupuesto
            </p>

            <div className="space-y-6">
              {[mockSolicitudes[1]].map((paciente) => (
                <div key={paciente.id} className="border-2 border-amber-200 bg-amber-50 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-amber-100 text-amber-600 p-3 rounded-lg">
                      <DollarSign className="size-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium mb-1">
                        {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      </div>
                      <div className="text-gray-500 text-sm font-mono mb-2">{paciente.numeroPaciente}</div>
                      <Badge variant="outline">Requiere Aprobación del Paciente</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white border border-amber-200 rounded-lg">
                      <span className="text-gray-500 text-sm block mb-1">Especialidad</span>
                      <span className="text-gray-900 text-sm font-medium">{paciente.especialidad ?? "—"}</span>
                    </div>
                    <div className="p-4 bg-white border border-amber-200 rounded-lg">
                      <span className="text-gray-500 text-sm block mb-1">Total del Plan</span>
                      <span className="text-gray-900 text-sm font-bold text-teal-700">S/ 510.00</span>
                    </div>
                    <div className="p-4 bg-white border border-amber-200 rounded-lg">
                      <span className="text-gray-500 text-sm block mb-1">Sesiones estimadas</span>
                      <span className="text-gray-900 text-sm font-medium">5 sesiones</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-gray-700 text-sm mb-2 block font-medium">Observaciones del odontólogo jefe:</label>
                    <Textarea placeholder="Notas sobre el plan aprobado..." rows={3} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button className="flex-1">Confirmar Aprobación del Paciente</Button>
                      <Button variant="outline" className="flex-1">Ofrecer Plan Alternativo</Button>
                    </div>
                    <Button variant="destructive" className="w-full">Paciente No Acepta el Plan</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* D03: Indicaciones y seguimiento */}
        <TabsContent value="notificacion" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2">Indicaciones Post-tratamiento</h2>
            <p className="text-gray-500 text-sm mb-6">
              Indicaciones médicas, cuidados en casa y programación de próxima cita
            </p>

            <div className="space-y-6">
              {mockSolicitudes.filter(s => s.estado === "TRATAMIENTO_COMPLETADO").slice(0, 2).map((paciente) => (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-gray-900 font-medium mb-1">
                        {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      </div>
                      <div className="text-gray-500 text-sm font-mono">{paciente.numeroPaciente}</div>
                    </div>
                    <Badge variant="default" className="bg-green-600">TRATAMIENTO COMPLETADO</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm block mb-1">Correo</span>
                      <span className="text-gray-900 text-sm">{paciente.cliente.email}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm block mb-1">Teléfono</span>
                      <span className="text-gray-900 text-sm">{paciente.cliente.telefono}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500 text-sm block mb-1">Canal</span>
                      <span className="text-gray-900 text-sm">Pendiente</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-gray-700 text-sm mb-2 block font-medium">Canal de Notificación:</label>
                    <Select value={canalNotificacion} onValueChange={setCanalNotificacion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2"><Mail className="size-4" />Correo Electrónico</div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2"><MessageSquare className="size-4" />SMS</div>
                        </SelectItem>
                        <SelectItem value="todos">Todos los Canales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-green-900 text-sm font-medium mb-2">Indicaciones post-tratamiento:</p>
                    <p className="text-green-800 text-sm">
                      Estimado/a {paciente.cliente.nombres}, su tratamiento de {paciente.especialidad} ha sido completado exitosamente.
                      Recuerde: cepillado 3 veces al día, uso de hilo dental y enjuague bucal. Próxima cita de control en 3 meses.
                    </p>
                  </div>

                  <Button className="w-full">
                    <Send className="size-4 mr-2" />
                    Enviar Indicaciones
                  </Button>
                </div>
              ))}

              {mockSolicitudes.filter(s => s.estado === "TRATAMIENTO_COMPLETADO").length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay tratamientos completados pendientes de indicaciones.</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
