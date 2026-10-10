import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { mockSolicitudes } from "../../utils/mockData";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  FileSignature,
  Calendar,
  SmilePlus,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

const sesionesDemo = [
  { numero: 1, procedimiento: "Profilaxis y evaluación inicial",   fecha: "05/11/2025", estado: "completada" },
  { numero: 2, procedimiento: "Resina compuesta pieza 16",          fecha: "12/11/2025", estado: "completada" },
  { numero: 3, procedimiento: "Resina compuesta pieza 25",          fecha: "19/11/2025", estado: "programada" },
  { numero: 4, procedimiento: "Detartraje y pulido",               fecha: "26/11/2025", estado: "programada" },
  { numero: 5, procedimiento: "Control y alta dental",             fecha: "03/12/2025", estado: "pendiente"  },
];

export function Contratacion() {
  const navigate = useNavigate();
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);

  const pacientesEnTratamiento = mockSolicitudes.filter(s =>
    s.estado === "EN_TRATAMIENTO" || s.estado === "TRATAMIENTO_COMPLETADO"
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Gestión de Tratamientos</h1>
          <p className="text-gray-500">T01-T02: Inicio, seguimiento de sesiones y alta dental del paciente</p>
        </div>
      </div>

      <Tabs defaultValue="inicio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inicio">
            <FileSignature className="size-4 mr-2" />
            Inicio del Tratamiento (T01)
          </TabsTrigger>
          <TabsTrigger value="sesiones">
            <Calendar className="size-4 mr-2" />
            Sesiones Programadas
          </TabsTrigger>
          <TabsTrigger value="alta">
            <SmilePlus className="size-4 mr-2" />
            Alta Dental (T02)
          </TabsTrigger>
        </TabsList>

        {/* T01: Inicio del Tratamiento */}
        <TabsContent value="inicio" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-6">Consentimiento y Inicio del Tratamiento</h2>

            <div className="space-y-6">
              {(pacientesEnTratamiento.length > 0 ? pacientesEnTratamiento : mockSolicitudes).slice(0, 2).map((paciente) => (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-gray-900 font-medium mb-1">
                        {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      </div>
                      <div className="text-gray-500 text-sm font-mono mb-2">{paciente.numeroPaciente}</div>
                      <Badge variant="default" className="bg-teal-600">{paciente.especialidad ?? "Odontología General"}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-sm">Odontólogo</div>
                      <div className="text-gray-900 text-sm">{paciente.medicoAsignado ?? "—"}</div>
                    </div>
                  </div>

                  {/* Resumen del plan */}
                  <div className="mb-6">
                    <h3 className="mb-4 text-sm font-medium">Resumen del Plan Aprobado</h3>
                    <div className="space-y-3">
                      {[
                        { campo: "Diagnóstico",           valor: paciente.diagnostico ?? "Pendiente" },
                        { campo: "Total del Tratamiento", valor: "S/ 510.00" },
                        { campo: "Sesiones Estimadas",    valor: "5 sesiones" },
                        { campo: "Duración Aproximada",   valor: "4-6 semanas" },
                      ].map(({ campo, valor }) => (
                        <div key={campo} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600 text-sm">{campo}</span>
                          <span className="text-gray-900 text-sm font-medium">{valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan de pago */}
                  <div className="mb-6">
                    <h3 className="mb-4 text-sm font-medium flex items-center gap-2">
                      <DollarSign className="size-4" />Plan de Pago
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { tipo: "Al contado",       desc: "5% dto.",   monto: "S/ 484.50" },
                        { tipo: "2 cuotas",         desc: "Sin interés",monto: "2 × S/ 255.00" },
                        { tipo: "5 cuotas",         desc: "Por sesión", monto: "5 × S/ 102.00" },
                      ].map(op => (
                        <div key={op.tipo} className="p-3 border border-gray-200 rounded-lg text-center hover:border-teal-400 cursor-pointer">
                          <div className="text-gray-900 text-sm font-medium">{op.tipo}</div>
                          <div className="text-teal-600 text-xs mt-0.5">{op.desc}</div>
                          <div className="text-gray-900 text-sm font-bold mt-1">{op.monto}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consentimiento */}
                  <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-center mb-4">
                      <FileSignature className="size-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="mb-2 text-sm font-medium">Consentimiento Informado para Tratamiento Dental</h3>
                      <p className="text-gray-600 text-sm">El paciente acepta el plan de tratamiento, el presupuesto y las condiciones de pago</p>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Checkbox
                        id={`consentimiento-${paciente.id}`}
                        checked={consentimientoAceptado}
                        onCheckedChange={v => setConsentimientoAceptado(v as boolean)}
                      />
                      <label htmlFor={`consentimiento-${paciente.id}`} className="text-gray-700 text-sm cursor-pointer">
                        Acepto el plan de tratamiento, presupuesto y condiciones de pago
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" disabled={!consentimientoAceptado}>
                      <CheckCircle2 className="size-4 mr-2" />
                      Confirmar Inicio de Tratamiento
                    </Button>
                    <Button variant="outline">Enviar Plan por Email</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Sesiones */}
        <TabsContent value="sesiones" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-6">Control de Sesiones de Tratamiento</h2>

            <div className="space-y-6">
              {pacientesEnTratamiento.slice(0, 1).concat(mockSolicitudes.slice(0, 1)).slice(0, 2).map((paciente) => (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-gray-900 font-medium">
                      {paciente.cliente.nombres} {paciente.cliente.apellidos}
                      <span className="text-gray-500 text-sm font-mono font-normal ml-3">{paciente.numeroPaciente}</span>
                    </div>
                    <Badge variant="outline">{paciente.especialidad ?? "Odontología General"}</Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    {sesionesDemo.map((sesion) => (
                      <div key={sesion.numero} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
                        <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          sesion.estado === "completada" ? "bg-green-100 text-green-700" :
                          sesion.estado === "programada" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {sesion.numero}
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900 text-sm">{sesion.procedimiento}</div>
                          <div className="text-gray-500 text-xs">{sesion.fecha}</div>
                        </div>
                        <Badge variant={sesion.estado === "completada" ? "default" : "outline"}
                          className={sesion.estado === "completada" ? "bg-green-600 text-xs" : "text-xs"}>
                          {sesion.estado === "completada" ? "Completada" : sesion.estado === "programada" ? "Programada" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor={`nueva-fecha-${paciente.id}`}>Programar nueva sesión</Label>
                      <Input id={`nueva-fecha-${paciente.id}`} type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor={`procedimiento-${paciente.id}`}>Procedimiento</Label>
                      <Input id={`procedimiento-${paciente.id}`} placeholder="Ej: Resina compuesta pieza 36" className="mt-1" />
                    </div>
                  </div>

                  <Button className="w-full">
                    <Calendar className="size-4 mr-2" />
                    Agregar Sesión
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* T02: Alta Dental */}
        <TabsContent value="alta" className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-6">Alta Dental y Cita de Control</h2>
            <p className="text-gray-600 text-sm mb-6">Cierre del plan de tratamiento e indicaciones para el paciente</p>

            <div className="space-y-6">
              {mockSolicitudes.filter(s => s.estado === "TRATAMIENTO_COMPLETADO").map((paciente) => (
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

                  <div className="mb-6">
                    <h3 className="mb-4 text-sm font-medium">Checklist de Alta</h3>
                    <div className="space-y-3">
                      {[
                        { paso: "Todas las sesiones completadas",          ok: true  },
                        { paso: "Radiografías de control tomadas",         ok: true  },
                        { paso: "Indicaciones de higiene entregadas",      ok: true  },
                        { paso: "Cita de control programada (3 meses)",    ok: false },
                        { paso: "Alta firmada por el odontólogo",          ok: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`size-7 rounded-full flex items-center justify-center ${item.ok ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {item.ok ? <CheckCircle2 className="size-4" /> : <div className="size-2.5 rounded-full bg-gray-400" />}
                          </div>
                          <span className={`text-sm ${item.ok ? "text-gray-900" : "text-gray-500"}`}>{item.paso}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor={`cita-control-${paciente.id}`}>Fecha de Cita de Control</Label>
                      <Input id={`cita-control-${paciente.id}`} type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor={`odontologo-control-${paciente.id}`}>Odontólogo de Control</Label>
                      <Input id={`odontologo-control-${paciente.id}`} defaultValue={paciente.medicoAsignado ?? ""} className="mt-1" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <SmilePlus className="size-4 mr-2" />
                      Confirmar Alta Dental
                    </Button>
                    <Button variant="outline">Imprimir Resumen</Button>
                  </div>
                </div>
              ))}

              {mockSolicitudes.filter(s => s.estado === "TRATAMIENTO_COMPLETADO").length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay tratamientos completados con alta pendiente.</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
