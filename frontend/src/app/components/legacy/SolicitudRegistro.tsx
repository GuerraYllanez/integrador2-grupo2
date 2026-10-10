import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useNavigate } from "react-router";
import { Save, ArrowLeft, SmilePlus } from "lucide-react";

export function SolicitudRegistro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "",
    numeroDocumento: "",
    fechaNacimiento: "",
    nacionalidad: "Peruana",
    email: "",
    telefono: "",
    direccion: "",
    distrito: "",
    departamento: "",
    tipoSeguro: "",
    numeroSeguro: "",
    motivoConsulta: "",
    ultimaVisitaDental: "",
    alergias: "",
    bruxismo: "",
    especialidad: "",
  });

  const set = (key: string, value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Paciente registrado exitosamente");
    navigate("/");
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1>Registro de Paciente</h1>
          <p className="text-gray-500">R01: Ingreso de datos del nuevo paciente dental</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Personales */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <SmilePlus className="size-5 text-teal-600" />
            <h2>Datos Personales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nombres">Nombres *</Label>
              <Input id="nombres" value={formData.nombres} onChange={e => set("nombres", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input id="apellidos" value={formData.apellidos} onChange={e => set("apellidos", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
              <Select value={formData.tipoDocumento} onValueChange={v => set("tipoDocumento", v)}>
                <SelectTrigger id="tipoDocumento"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CE">Carné de Extranjería</SelectItem>
                  <SelectItem value="PAS">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <Input id="numeroDocumento" value={formData.numeroDocumento} onChange={e => set("numeroDocumento", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
              <Input id="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={e => set("fechaNacimiento", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="nacionalidad">Nacionalidad *</Label>
              <Input id="nacionalidad" value={formData.nacionalidad} onChange={e => set("nacionalidad", e.target.value)} required />
            </div>
          </div>
        </Card>

        {/* Datos de Contacto */}
        <Card className="p-6">
          <h2 className="mb-6">Datos de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => set("email", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input id="telefono" value={formData.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+51 999 999 999" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input id="direccion" value={formData.direccion} onChange={e => set("direccion", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="distrito">Distrito *</Label>
              <Input id="distrito" value={formData.distrito} onChange={e => set("distrito", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="departamento">Departamento *</Label>
              <Input id="departamento" value={formData.departamento} onChange={e => set("departamento", e.target.value)} required />
            </div>
          </div>
        </Card>

        {/* Antecedentes Odontológicos */}
        <Card className="p-6">
          <h2 className="mb-6">Antecedentes Odontológicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="ultimaVisitaDental">Última visita al dentista</Label>
              <Input id="ultimaVisitaDental" type="date" value={formData.ultimaVisitaDental} onChange={e => set("ultimaVisitaDental", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bruxismo">Hábitos parafuncionales</Label>
              <Select value={formData.bruxismo} onValueChange={v => set("bruxismo", v)}>
                <SelectTrigger id="bruxismo"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguno">Ninguno</SelectItem>
                  <SelectItem value="bruxismo">Bruxismo (rechinar de dientes)</SelectItem>
                  <SelectItem value="onicofagia">Onicofagia (morderse las uñas)</SelectItem>
                  <SelectItem value="succion">Succión del pulgar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alergias">Alergias a anestésicos o materiales dentales</Label>
              <Input id="alergias" value={formData.alergias} onChange={e => set("alergias", e.target.value)} placeholder="Ej: lidocaína, látex, amalgama, ninguna" />
            </div>
            <div>
              <Label htmlFor="motivoConsulta">Motivo de Consulta *</Label>
              <Input id="motivoConsulta" value={formData.motivoConsulta} onChange={e => set("motivoConsulta", e.target.value)} placeholder="Ej: dolor molar, revisión general, ortodoncia..." required />
            </div>
          </div>
        </Card>

        {/* Cobertura y Especialidad */}
        <Card className="p-6">
          <h2 className="mb-6">Cobertura y Especialidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="tipoSeguro">Tipo de Cobertura *</Label>
              <Select value={formData.tipoSeguro} onValueChange={v => set("tipoSeguro", v)}>
                <SelectTrigger id="tipoSeguro"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASEGURADO_EPS">EPS / Seguro Privado</SelectItem>
                  <SelectItem value="PARTICULAR">Particular (pago directo)</SelectItem>
                  <SelectItem value="CONVENIO">Convenio Empresarial</SelectItem>
                  <SelectItem value="ODONTOPEDIATRIA">Odontopediatría</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numeroSeguro">N° de Póliza / Convenio</Label>
              <Input id="numeroSeguro" value={formData.numeroSeguro} onChange={e => set("numeroSeguro", e.target.value)} placeholder="Número de afiliación (opcional)" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="especialidad">Especialidad requerida</Label>
              <Select value={formData.especialidad} onValueChange={v => set("especialidad", v)}>
                <SelectTrigger id="especialidad"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="odontologia_general">Odontología General</SelectItem>
                  <SelectItem value="ortodoncia">Ortodoncia</SelectItem>
                  <SelectItem value="endodoncia">Endodoncia</SelectItem>
                  <SelectItem value="periodoncia">Periodoncia</SelectItem>
                  <SelectItem value="cirugia_oral">Cirugía Oral y Maxilofacial</SelectItem>
                  <SelectItem value="odontopediatria">Odontopediatría</SelectItem>
                  <SelectItem value="implantologia">Implantología</SelectItem>
                  <SelectItem value="blanqueamiento">Blanqueamiento Dental</SelectItem>
                  <SelectItem value="urgencia">Urgencia Dental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            <Save className="size-4 mr-2" />
            Registrar Paciente
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
