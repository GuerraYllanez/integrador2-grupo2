import { createBrowserRouter } from "react-router";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";

// ============================================================
// PACIENTES
// ============================================================

import Pacientes from "../pages/pacientes/Pacientes";
import PacienteDetalle from "../pages/pacientes/PacienteDetalle";
import PacienteFormulario from "../pages/pacientes/PacienteFormulario";

// ============================================================
// HISTORIAS CLÍNICAS
// ============================================================

import HistoriaClinica from "../pages/historias/HistoriaClinica";
import HistoriaDetalle from "../pages/historias/HistoriaDetalle";
import HistoriaFormulario from "../pages/historias/HistoriaFormulario";
import HistoriaEditar from "../pages/historias/HistoriaEditar";

// ============================================================
// EVALUACIONES CLÍNICAS
// ============================================================

import EvaluacionesClinicas from "../pages/evaluaciones/EvaluacionesClinicas";
import EvaluacionFormulario from "../pages/evaluaciones/EvaluacionFormulario";
import EvaluacionDetalle from "../pages/evaluaciones/EvaluacionDetalle";
import EvaluacionEditar from "../pages/evaluaciones/EvaluacionEditar";

// ============================================================
// TRATAMIENTOS
// ============================================================

import Tratamientos from "../pages/tratamientos/Tratamientos";
import TratamientoFormulario from "../pages/tratamientos/TratamientoFormulario";
import TratamientoDetalle from "../pages/tratamientos/TratamientoDetalle";

// ============================================================
// CITAS
// ============================================================

import Citas from "../pages/citas/Citas";
import CitaFormulario from "../pages/citas/CitaFormulario";
import CitaDetalle from "../pages/citas/CitaDetalle";

// ============================================================
// HORARIOS
// ============================================================

import Horarios from "../pages/horarios/Horarios";
import HorarioFormulario from "../pages/horarios/HorarioFormulario";
import HorarioDetalle from "../pages/horarios/HorarioDetalle";

// ============================================================
// PAGOS
// ============================================================

import Pagos from "../pages/pagos/Pagos";
import PagoFormulario from "../pages/pagos/PagoFormulario";
import PagoDetalle from "../pages/pagos/PagoDetalle";

// ============================================================
// REPROGRAMACIONES
// ============================================================

import Reprogramaciones from "../pages/reprogramaciones/reprogramaciones";
import ReprogramacionFormulario from "../pages/reprogramaciones/reprogramacionFormulario";
import ReprogramacionDetalle from "../pages/reprogramaciones/reprogramacionDetalle";

// ============================================================
// SERVICIOS
// ============================================================

import Servicios from "../pages/servicios/Servicios";

// ============================================================
// ODONTÓLOGOS
// ============================================================

import Odontologos from "../pages/odontologos/Odontologos";
import OdontologoFormulario from "../pages/odontologos/OdontologoFormulario";
import OdontologoDetalle from "../pages/odontologos/OdontologoDetalle";

// ============================================================
// MARKETING
// ============================================================

import Marketing from "../pages/marketing/Marketing";
import MarketingFormulario from "../pages/marketing/MarketingFormulario";
import MarketingDetalle from "../pages/marketing/MarketingDetalle";

// ============================================================
// OTROS MÓDULOS
// ============================================================

import CasosEspeciales from "../pages/casos-especiales/CasosEspeciales";
import Auditoria from "../pages/auditoria/Auditoria";

// ============================================================
// ROUTER PRINCIPAL
// ============================================================

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,

    children: [
      // ============================================================
      // DASHBOARD
      // ============================================================

      {
        index: true,
        Component: Dashboard,
      },

      // ============================================================
      // PACIENTES
      // ============================================================

      {
        path: "pacientes",
        Component: Pacientes,
      },

      {
        path: "pacientes/nuevo",
        Component: PacienteFormulario,
      },

      {
        path: "pacientes/:id/editar",
        Component: PacienteFormulario,
      },

      {
        path: "pacientes/:id",
        Component: PacienteDetalle,
      },

      // ============================================================
      // HISTORIAS CLÍNICAS
      // ============================================================

      {
        path: "historias",
        Component: HistoriaClinica,
      },

      {
        path: "historias/nueva",
        Component: HistoriaFormulario,
      },

      {
        path: "historias/:id/editar",
        Component: HistoriaEditar,
      },

      {
        path: "historias/:id",
        Component: HistoriaDetalle,
      },

      // ============================================================
      // EVALUACIONES CLÍNICAS
      // ============================================================

      {
        path: "evaluaciones",
        Component: EvaluacionesClinicas,
      },

      {
        path: "evaluaciones/nueva",
        Component: EvaluacionFormulario,
      },

      {
        path: "evaluaciones/:id/editar",
        Component: EvaluacionEditar,
      },

      {
        path: "evaluaciones/:id",
        Component: EvaluacionDetalle,
      },

      // ============================================================
      // TRATAMIENTOS
      // ============================================================

      {
        path: "tratamientos",
        Component: Tratamientos,
      },

      {
        path: "tratamientos/nuevo",
        Component: TratamientoFormulario,
      },

      {
        path: "tratamientos/:id/editar",
        Component: TratamientoFormulario,
      },

      {
        path: "tratamientos/:id",
        Component: TratamientoDetalle,
      },

      // ============================================================
      // CITAS
      // ============================================================

      {
        path: "citas",
        Component: Citas,
      },

      {
        path: "citas/nueva",
        Component: CitaFormulario,
      },

      {
        path: "citas/:id/editar",
        Component: CitaFormulario,
      },

      {
        path: "citas/:id",
        Component: CitaDetalle,
      },

      // ============================================================
      // HORARIOS
      // ============================================================

      {
        path: "horarios",
        Component: Horarios,
      },

      {
        path: "horarios/nuevo",
        Component: HorarioFormulario,
      },

      {
        path: "horarios/:id/editar",
        Component: HorarioFormulario,
      },

      {
        path: "horarios/:id",
        Component: HorarioDetalle,
      },

      // ============================================================
      // PAGOS
      // ============================================================

      {
        path: "pagos",
        Component: Pagos,
      },

      {
        path: "pagos/nuevo",
        Component: PagoFormulario,
      },

      {
        path: "pagos/:id/editar",
        Component: PagoFormulario,
      },

      {
        path: "pagos/:id",
        Component: PagoDetalle,
      },

      // ============================================================
      // REPROGRAMACIONES
      // ============================================================

      {
        path: "reprogramaciones",
        Component: Reprogramaciones,
      },

      {
        path: "reprogramaciones/nueva",
        Component: ReprogramacionFormulario,
      },

      {
        path: "reprogramaciones/:id/editar",
        Component: ReprogramacionFormulario,
      },

      {
        path: "reprogramaciones/:id",
        Component: ReprogramacionDetalle,
      },

      // ============================================================
      // SERVICIOS
      // ============================================================

      {
        path: "servicios",
        Component: Servicios,
      },

      // ============================================================
      // ODONTÓLOGOS
      // ============================================================

      {
        path: "odontologos",
        Component: Odontologos,
      },

      {
        path: "odontologos/nuevo",
        Component: OdontologoFormulario,
      },

      {
        path: "odontologos/:id/editar",
        Component: OdontologoFormulario,
      },

      {
        path: "odontologos/:id",
        Component: OdontologoDetalle,
      },

      // ============================================================
      // MARKETING
      // ============================================================

      {
        path: "marketing",
        Component: Marketing,
      },

      {
        path: "marketing/nuevo",
        Component: MarketingFormulario,
      },

      {
        path: "marketing/:id/editar",
        Component: MarketingFormulario,
      },

      {
        path: "marketing/:id",
        Component: MarketingDetalle,
      },

      // ============================================================
      // CASOS ESPECIALES
      // ============================================================
      //
      // U01 - Urgencias Dentales
      // U02 - Historias Duplicadas
      // Pacientes Extranjeros
      //
      // Las tres funcionalidades se manejan dentro de
      // CasosEspeciales.tsx mediante navegación interna.
      //
      // U01 consume:
      // /api/urgencias
      // /api/urgencias/activas
      // /api/urgencias/{id}
      // /api/urgencias/{id}/estado
      // ============================================================

      {
        path: "casos-especiales",
        Component: CasosEspeciales,
      },

      // ============================================================
      // AUDITORÍA
      // ============================================================

      {
        path: "auditoria",
        Component: Auditoria,
      },
    ],
  },
]);