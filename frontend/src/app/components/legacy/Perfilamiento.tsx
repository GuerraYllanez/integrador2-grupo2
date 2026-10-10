import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { mockSolicitudes, tiposPaciente } from "../../utils/mockData";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield, User, Briefcase, Baby } from "lucide-react";

const perfiles = [
  {
    tipo: "ASEGURADO_EPS",
    label: "EPS / Seguro Privado",
    descripcion: "Cobertura de plan dental privado o EPS",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    tipo: "PARTICULAR",
    label: "Particular",
    descripcion: "Pago directo — sin cobertura de seguro",
    icon: User,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    tipo: "CONVENIO",
    label: "Convenio Empresarial",
    descripcion: "Descuento por convenio de empresa u organización",
    icon: Briefcase,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    tipo: "ODONTOPEDIATRIA",
    label: "Odontopediatría",
    descripcion: "Paciente menor de 14 años — atención especializada",
    icon: Baby,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
];

export function Perfilamiento() {
  const navigate = useNavigate();
  const pacientesConHistoria = mockSolicitudes.filter(s =>
    ["HO01", "HO02", "R01", "ED01"].includes(s.etapa)
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Historia Dental</h1>
          <p className="text-gray-500">HO: Clasificación del paciente y antecedentes odontológicos</p>
        </div>
      </div>

      {/* Tipos de cobertura */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {perfiles.map((perfil) => {
          const Icon = perfil.icon;
          const count = mockSolicitudes.filter(s => s.tipoPaciente === perfil.tipo).length;
          return (
            <Card key={perfil.tipo} className={`p-6 border-2 ${perfil.borderColor}`}>
              <div className={`${perfil.bgColor} ${perfil.color} p-3 rounded-lg w-fit mb-4`}>
                <Icon className="size-6" />
              </div>
              <h3 className="mb-2">{perfil.label}</h3>
              <p className="text-gray-600 text-sm mb-4">{perfil.descripcion}</p>
              <div className="text-gray-900 font-semibold">
                {count} {count === 1 ? "paciente" : "pacientes"}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pacientes en proceso de historia dental */}
      <Card className="p-6">
        <h2 className="mb-6">Pacientes en Proceso de Historia Odontológica</h2>

        {pacientesConHistoria.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay pacientes en esta etapa actualmente.</p>
        ) : (
          <div className="space-y-4">
            {pacientesConHistoria.map((paciente) => {
              const perfil = perfiles.find(p => p.tipo === paciente.tipoPaciente);
              const PerfilIcon = perfil?.icon ?? User;
              return (
                <div key={paciente.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`${perfil?.bgColor ?? "bg-gray-100"} ${perfil?.color ?? "text-gray-600"} p-3 rounded-lg`}>
                        <PerfilIcon className="size-6" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium mb-1">
                          {paciente.cliente.nombres} {paciente.cliente.apellidos}
                        </div>
                        <div className="text-gray-500 text-sm mb-2 font-mono">{paciente.numeroPaciente}</div>
                        {paciente.tipoPaciente && (
                          <Badge variant="outline">
                            {tiposPaciente[paciente.tipoPaciente as keyof typeof tiposPaciente]?.label ?? paciente.tipoPaciente}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Ver Historia</Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-gray-500 text-sm">Documento:</span>
                      <div className="text-gray-900 text-sm">{paciente.cliente.tipoDocumento} {paciente.cliente.numeroDocumento}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Última visita dental:</span>
                      <div className="text-gray-900 text-sm">
                        {paciente.cliente.ultimaVisitaDental
                          ? new Date(paciente.cliente.ultimaVisitaDental).toLocaleDateString("es-PE")
                          : "Sin registro previo"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Etapa:</span>
                      <div className="text-gray-900 text-sm">{paciente.etapa}</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <p className="text-teal-900 text-sm font-medium mb-2">Criterios de Historia Dental:</p>
                    <ul className="text-teal-800 text-sm space-y-1">
                      <li>✓ Antecedentes odontológicos y tratamientos previos</li>
                      <li>✓ Alergias a anestésicos o materiales dentales</li>
                      <li>✓ Hábitos de higiene oral y parafunciones (bruxismo)</li>
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mockSolicitudes.filter(s => !s.tipoPaciente).length > 0 && (
          <div className="mt-6">
            <h3 className="text-gray-600 mb-4 text-sm font-medium">Pacientes sin tipo de cobertura asignado</h3>
            <div className="space-y-3">
              {mockSolicitudes.filter(s => !s.tipoPaciente).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg">
                  <div>
                    <span className="text-gray-900 font-medium">{p.cliente.nombres} {p.cliente.apellidos}</span>
                    <span className="text-gray-500 text-sm ml-3 font-mono">{p.numeroPaciente}</span>
                  </div>
                  <Button size="sm" variant="outline">Asignar Tipo</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
