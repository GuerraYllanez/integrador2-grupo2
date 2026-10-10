export interface Paciente {
  id: string;
  numeroPaciente: string;
  cliente: {
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    telefono: string;
    fechaNacimiento: string;
    nacionalidad: string;
    ultimaVisitaDental?: string;
  };
  etapa: string;
  estado: string;
  tipoPaciente?: string;
  medicoAsignado?: string;
  especialidad?: string;
  diagnostico?: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

export type Solicitud = Paciente;

export const mockSolicitudes: Paciente[] = [
  {
    id: "1",
    numeroPaciente: "ODAM-2025-001234",
    cliente: {
      nombres: "María Elena",
      apellidos: "Rodríguez Pérez",
      tipoDocumento: "DNI",
      numeroDocumento: "45678912",
      email: "maria.rodriguez@email.com",
      telefono: "+51 987 654 321",
      fechaNacimiento: "1985-03-12",
      nacionalidad: "Peruana",
      ultimaVisitaDental: "2024-06-10",
    },
    etapa: "R01",
    estado: "EN_REGISTRO",
    fechaCreacion: "2025-11-20",
    ultimaActualizacion: "2025-11-23",
  },
  {
    id: "2",
    numeroPaciente: "ODAM-2025-001235",
    cliente: {
      nombres: "Carlos Alberto",
      apellidos: "Mendoza Torres",
      tipoDocumento: "DNI",
      numeroDocumento: "78945612",
      email: "carlos.mendoza@email.com",
      telefono: "+51 912 345 678",
      fechaNacimiento: "1972-07-28",
      nacionalidad: "Peruana",
      ultimaVisitaDental: "2023-11-05",
    },
    etapa: "ED01",
    estado: "EN_CONSULTA",
    tipoPaciente: "CONVENIO",
    medicoAsignado: "Dr. Jorge Quispe",
    especialidad: "Odontología General",
    diagnostico: "Caries múltiples grado II — 3 piezas afectadas",
    fechaCreacion: "2025-11-18",
    ultimaActualizacion: "2025-11-23",
  },
  {
    id: "3",
    numeroPaciente: "ODAM-2025-001236",
    cliente: {
      nombres: "Ana Sofía",
      apellidos: "Vargas Quispe",
      tipoDocumento: "DNI",
      numeroDocumento: "65432198",
      email: "ana.vargas@email.com",
      telefono: "+51 998 765 432",
      fechaNacimiento: "1990-11-05",
      nacionalidad: "Peruana",
      ultimaVisitaDental: "2025-01-20",
    },
    etapa: "T02",
    estado: "TRATAMIENTO_COMPLETADO",
    tipoPaciente: "ASEGURADO_EPS",
    medicoAsignado: "Dra. Patricia Flores",
    especialidad: "Ortodoncia",
    diagnostico: "Maloclusión clase II — tratamiento de ortodoncia completado",
    fechaCreacion: "2025-11-15",
    ultimaActualizacion: "2025-11-22",
  },
  {
    id: "4",
    numeroPaciente: "ODAM-2025-001237",
    cliente: {
      nombres: "Roberto",
      apellidos: "Silva Costa",
      tipoDocumento: "CE",
      numeroDocumento: "001245789",
      email: "roberto.silva@email.com",
      telefono: "+51 945 678 123",
      fechaNacimiento: "1968-09-14",
      nacionalidad: "Brasileña",
      ultimaVisitaDental: undefined,
    },
    etapa: "U01",
    estado: "URGENCIA_DENTAL",
    tipoPaciente: "PARTICULAR",
    medicoAsignado: "Dr. Luis Gómez",
    especialidad: "Cirugía Oral",
    diagnostico: "Absceso periapical pieza 26 — drenaje urgente",
    fechaCreacion: "2025-11-19",
    ultimaActualizacion: "2025-11-23",
  },
  {
    id: "5",
    numeroPaciente: "ODAM-2025-001238",
    cliente: {
      nombres: "Patricia",
      apellidos: "Flores Ramírez",
      tipoDocumento: "DNI",
      numeroDocumento: "32165498",
      email: "patricia.flores@email.com",
      telefono: "+51 923 456 789",
      fechaNacimiento: "1995-01-20",
      nacionalidad: "Peruana",
      ultimaVisitaDental: "2025-03-14",
    },
    etapa: "ED02",
    estado: "EN_EVALUACION",
    tipoPaciente: "ASEGURADO_EPS",
    medicoAsignado: "Dra. Rosa Méndez",
    especialidad: "Periodoncia",
    diagnostico: "Periodontitis moderada — requiere raspado y alisado radicular",
    fechaCreacion: "2025-11-17",
    ultimaActualizacion: "2025-11-23",
  },
  {
    id: "6",
    numeroPaciente: "ODAM-2025-001239",
    cliente: {
      nombres: "Luis Fernando",
      apellidos: "Gómez Paredes",
      tipoDocumento: "DNI",
      numeroDocumento: "87654321",
      email: "luis.gomez@email.com",
      telefono: "+51 987 123 456",
      fechaNacimiento: "1980-06-03",
      nacionalidad: "Peruana",
      ultimaVisitaDental: "2024-12-01",
    },
    etapa: "T01",
    estado: "EN_TRATAMIENTO",
    tipoPaciente: "ASEGURADO_EPS",
    medicoAsignado: "Dr. Héctor Vidal",
    especialidad: "Implantología",
    diagnostico: "Edéntulo parcial — colocación de implante pieza 36",
    fechaCreacion: "2025-11-14",
    ultimaActualizacion: "2025-11-22",
  },
];

export const etapas = [
  { codigo: "R01",  nombre: "Registro Inicial",           descripcion: "Datos del paciente y motivo de consulta" },
  { codigo: "HO01", nombre: "Historia Odontológica Nueva", descripcion: "Apertura de historia clínica dental" },
  { codigo: "HO02", nombre: "Actualización Historia",      descripcion: "Actualización de historia odontológica" },
  { codigo: "V01",  nombre: "Validación de Documentos",    descripcion: "Verificación de identidad y seguro" },
  { codigo: "V02",  nombre: "Validación de Seguro",        descripcion: "Cobertura de plan dental" },
  { codigo: "ED01", nombre: "Examen Clínico Dental",       descripcion: "Odontograma y evaluación oral" },
  { codigo: "ED02", nombre: "Radiografías / Imágenes",     descripcion: "Rx periapical, panorámica o CBCT" },
  { codigo: "ED03", nombre: "Evaluación Especialista",     descripcion: "Interconsulta con especialista dental" },
  { codigo: "PT01", nombre: "Plan de Tratamiento",         descripcion: "Elaboración del plan y presupuesto" },
  { codigo: "PT02", nombre: "Aprobación del Plan",         descripcion: "Firma y aprobación por el paciente" },
  { codigo: "T01",  nombre: "Tratamiento en Curso",        descripcion: "Sesiones de tratamiento activas" },
  { codigo: "T02",  nombre: "Control Post-tratamiento",    descripcion: "Revisión y seguimiento dental" },
  { codigo: "U01",  nombre: "Triaje Urgencia Dental",      descripcion: "Clasificación de urgencia odontológica" },
  { codigo: "U02",  nombre: "Atención de Urgencia",        descripcion: "Atención inmediata de dolor/trauma" },
];

export const estados = {
  EN_REGISTRO:            { label: "En Registro",           color: "blue"   },
  CITA_PROGRAMADA:        { label: "Cita Programada",       color: "yellow" },
  EN_CONSULTA:            { label: "En Consulta",           color: "purple" },
  EN_EVALUACION:          { label: "En Evaluación",         color: "orange" },
  EN_TRATAMIENTO:         { label: "En Tratamiento",        color: "cyan"   },
  TRATAMIENTO_COMPLETADO: { label: "Tratamiento Completado",color: "green"  },
  URGENCIA_DENTAL:        { label: "Urgencia Dental",       color: "red"    },
  EN_CONTROL:             { label: "En Control",            color: "cyan"   },
};

export const tiposPaciente = {
  ASEGURADO_EPS: { label: "EPS / Seguro Privado",   descripcion: "Cobertura de plan dental privado" },
  PARTICULAR:    { label: "Particular",              descripcion: "Pago directo sin seguro" },
  CONVENIO:      { label: "Convenio Empresarial",   descripcion: "Descuento por convenio de empresa" },
  ODONTOPEDIATRIA: { label: "Odontopediatría",      descripcion: "Paciente menor de 14 años" },
};
