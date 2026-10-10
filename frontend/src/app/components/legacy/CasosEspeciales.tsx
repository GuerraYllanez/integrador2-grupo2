import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { mockSolicitudes } from "../../utils/mockData";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  AlertTriangle,
  Globe,
  Copy,
  Search,
  Clock,
  Zap,
} from "lucide-react";
import { Textarea } from "../ui/textarea";

const urgenciasDentales = [
  { tipo: "Dolor Agudo",         color: "red",    icon: "🦷", desc: "Dolor dental severo — pulpitis o absceso" },
  { tipo: "Absceso Dental",      color: "red",    icon: "🩹", desc: "Inflamación purulenta — requiere drenaje" },
  { tipo: "Trauma Dental",       color: "orange", icon: "⚡", desc: "Fractura, avulsión o luxación dentaria" },
  { tipo: "Hemorragia Post-op",  color: "red",    icon: "🩸", desc: "Sangrado tras extracción o cirugía oral" },
  { tipo: "Fractura Coronaria",  color: "orange", icon: "💥", desc: "Fractura de corona visible sin compromiso pulpar" },
];

export function CasosEspeciales() {
  const navigate = useNavigate();
  const [busquedaDuplicado, setBusquedaDuplicado] = useState("");

  const urgencias = mockSolicitudes.filter(s => s.estado === "URGENCIA_DENTAL");
  const extranjerosActivos = mockSolicitudes.filter(s => s.cliente.nacionalidad !== "Peruana");

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Urgencias Dentales y Casos Especiales</h1>
          <p className="text-gray-500">U01-U02: Triaje dental, pacientes extranjeros y gestión de duplicados</p>
        </div>
      </div>

      <Tabs defaultValue="urgencias" className="space-y-6">
        <TabsList>
          <TabsTrigger value="urgencias">
            <AlertTriangle className="size-4 mr-2" />
            Urgencias Dentales (U01)
          </TabsTrigger>
          <TabsTrigger value="extranjeros">
            <Globe className="size-4 mr-2" />
            Pacientes Extranjeros
          </TabsTrigger>
          <TabsTrigger value="duplicados">
            <Copy className="size-4 mr-2" />
            Historias Duplicadas (U02)
          </TabsTrigger>
        </TabsList>

        {/* U01: Urgencias Dentales */}
        <TabsContent value="urgencias" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="size-5 text-red-600" />
              <h2>Triaje Dental de Urgencias</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {urgenciasDentales.map((u) => (
                <div key={u.tipo} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  u.color === "red" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                }`}>
                  <span className="text-2xl">{u.icon}</span>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${u.color === "red" ? "text-red-900" : "text-orange-900"}`}>{u.tipo}</div>
                    <div className={`text-xs ${u.color === "red" ? "text-red-700" : "text-orange-700"}`}>{u.desc}</div>
                  </div>
                  <Button size="sm" variant={u.color === "red" ? "destructive" : "outline"} className={u.color === "orange" ? "border-orange-400 text-orange-700" : ""}>
                    Atender
                  </Button>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <Label htmlFor="nota-urgencia">Nota de triaje para el paciente:</Label>
              <Textarea
                id="nota-urgencia"
                placeholder="Describir sintomatología, tiempo de evolución, medicación previa..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="pieza-urgencia">Pieza dental afectada</Label>
                <Input id="pieza-urgencia" placeholder="Ej: 26, 47..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="escala-dolor">Escala de dolor (0-10)</Label>
                <Input id="escala-dolor" type="number" min={0} max={10} placeholder="0-10" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="tiempo-dolor">Tiempo de evolución</Label>
                <Input id="tiempo-dolor" placeholder="Ej: 2 días, 1 semana" className="mt-1" />
              </div>
            </div>

            <Button className="w-full bg-red-600 hover:bg-red-700">
              <AlertTriangle className="size-4 mr-2" />
              Registrar Urgencia Dental
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-red-600" />
              <h2>Pacientes en Urgencia Activa</h2>
            </div>

            {urgencias.length > 0 ? (
              <div className="space-y-3">
                {urgencias.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium text-sm">{p.cliente.nombres} {p.cliente.apellidos}</div>
                      <div className="text-red-700 text-xs font-mono">{p.numeroPaciente}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{p.diagnostico ?? "Urgencia dental"}</div>
                    </div>
                    <Button size="sm" variant="destructive">Ver Caso</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="size-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay urgencias activas en este momento</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Pacientes Extranjeros */}
        <TabsContent value="extranjeros" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="size-5 text-blue-600" />
              <h2>Pacientes Extranjeros</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Gestión de cobertura internacional, pasaportes y carné de extranjería
            </p>

            {extranjerosActivos.length > 0 ? (
              <div className="space-y-4">
                {extranjerosActivos.map(p => (
                  <div key={p.id} className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-gray-900 font-medium">{p.cliente.nombres} {p.cliente.apellidos}</div>
                        <div className="text-gray-500 text-sm font-mono">{p.numeroPaciente}</div>
                      </div>
                      <Badge variant="outline" className="border-blue-400 text-blue-700">{p.cliente.nacionalidad}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Documento",    valor: `${p.cliente.tipoDocumento}: ${p.cliente.numeroDocumento}` },
                        { label: "Cobertura",    valor: p.tipoPaciente ?? "PARTICULAR" },
                        { label: "Especialidad", valor: p.especialidad ?? "—" },
                      ].map(({ label, valor }) => (
                        <div key={label} className="p-3 bg-white rounded-lg border border-blue-200">
                          <div className="text-blue-600 text-xs mb-1">{label}</div>
                          <div className="text-gray-900 text-sm font-medium">{valor}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-3">
                      <Label>Notas de cobertura internacional:</Label>
                      <Textarea placeholder="Seguro internacional, convenio, carta de garantía..." rows={2} className="mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Validar Cobertura</Button>
                      <Button size="sm" variant="outline">Solicitar Carta de Garantía</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="size-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay pacientes extranjeros registrados actualmente</p>
              </div>
            )}

            <div className="mt-6 p-4 border border-dashed border-blue-300 rounded-lg">
              <h3 className="mb-4 text-sm font-medium">Registro Rápido — Paciente Extranjero</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pasaporte / Carné de Extranjería</Label>
                  <Input placeholder="Número de documento" className="mt-1" />
                </div>
                <div>
                  <Label>País de Procedencia</Label>
                  <Input placeholder="Ej: Colombia, Ecuador..." className="mt-1" />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* U02: Historias Duplicadas */}
        <TabsContent value="duplicados" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="size-5 text-amber-600" />
              <h2>Detección de Historias Clínicas Duplicadas</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Buscar y fusionar registros duplicados de pacientes en el sistema
            </p>

            <div className="mb-6">
              <Label htmlFor="busqueda-dup">Buscar por nombre, documento o número de historia</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="busqueda-dup"
                  value={busquedaDuplicado}
                  onChange={e => setBusquedaDuplicado(e.target.value)}
                  placeholder="Ej: García López, 12345678, ODAM-2025-000001"
                />
                <Button variant="outline">
                  <Search className="size-4" />
                </Button>
              </div>
            </div>

            <div className="border-2 border-amber-300 bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-4 text-amber-600" />
                <span className="text-amber-800 text-sm font-medium">Posible duplicado detectado</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { titulo: "Historia Original",  num: "ODAM-2025-000001", fecha: "15/09/2025", especialidad: "Ortodoncia"         },
                  { titulo: "Posible Duplicado",  num: "ODAM-2025-000007", fecha: "18/11/2025", especialidad: "Odontología General" },
                ].map((hist) => (
                  <div key={hist.titulo} className="p-3 bg-white border border-amber-200 rounded-lg">
                    <div className="text-amber-700 text-xs font-medium mb-2">{hist.titulo}</div>
                    <div className="text-gray-500 text-xs">N°: <span className="font-mono text-gray-900">{hist.num}</span></div>
                    <div className="text-gray-500 text-xs">Registro: {hist.fecha}</div>
                    <div className="text-gray-500 text-xs">Especialidad: {hist.especialidad}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Fusionar Historias</Button>
                <Button size="sm" variant="outline">Ver Detalles</Button>
                <Button size="sm" variant="ghost">No es duplicado</Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Duplicados Detectados", valor: "3",  color: "amber" },
                { label: "Fusionados este mes",   valor: "12", color: "green" },
                { label: "Por revisar",           valor: "1",  color: "red"   },
              ].map(({ label, valor, color }) => (
                <div key={label} className={`p-4 rounded-lg border text-center ${
                  color === "amber" ? "bg-amber-50 border-amber-200" :
                  color === "green" ? "bg-green-50 border-green-200" :
                  "bg-red-50 border-red-200"
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    color === "amber" ? "text-amber-700" : color === "green" ? "text-green-700" : "text-red-700"
                  }`}>{valor}</div>
                  <div className="text-gray-600 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
