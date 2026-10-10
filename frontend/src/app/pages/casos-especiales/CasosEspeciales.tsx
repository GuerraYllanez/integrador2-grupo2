import { useEffect, useMemo, useState } from "react";

import * as urgenciasApi from "../../api/urgenciasApi";
import * as pacientesExtranjerosApi from "../../api/pacientesExtranjerosApi";
import { pacientesApi } from "../../api/pacientesApi";
import * as duplicadosApi from "../../api/duplicadosApi";
import {
  historiasApi,
  type HistoriaClinicaResponse,
} from "../../api/historiasApi";

import "./CasosEspeciales.css";

// ============================================================
// TIPOS
// ============================================================

type ModuloEspecial =
  | "urgencias"
  | "extranjeros"
  | "duplicados";

type ModalTipo =
  | "urgencia-ver"
  | "urgencia-editar"
  | "urgencia-nueva"
  | "extranjero-editar"
  | "extranjero-nuevo"
  | "duplicado-ver"
  | null;

type EstadoUrgencia =
  urgenciasApi.EstadoUrgencia;

type EstadoCobertura =
  pacientesExtranjerosApi.EstadoCobertura;

type TipoDocumentoExtranjero =
  pacientesExtranjerosApi.TipoDocumentoExtranjero;

type EstadoCartaGarantia =
  pacientesExtranjerosApi.EstadoCartaGarantia;

interface Paciente {
  idPaciente: number;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono?: string;
  correo?: string;
}

interface HistoriaSeleccionada {
  idHistoria: number;
  codigoHistoria: string;
}

interface UrgenciaFormulario {
  idPaciente: number | "";
  idHistoria: number | "";
  tipoUrgencia: string;
  descripcion: string;
  estado: EstadoUrgencia;
}

interface ExtranjeroFormulario {
  idPaciente: number | "";
  nacionalidad: string;
  tipoDocumento: TipoDocumentoExtranjero;
  numeroDocumento: string;
  cobertura: string;
  especialidad: string;
  estadoCobertura: EstadoCobertura;
  cartaGarantia: EstadoCartaGarantia;
  observaciones: string;
}

/**
 * U02 trabaja con urgencias dentales.
 *
 * Un posible duplicado se determina cuando dos urgencias
 * pertenecen al mismo paciente y a la misma historia clínica.
 */
interface DuplicadoDetectado {
  clave: string;
  original: urgenciasApi.UrgenciaDental;
  duplicado: urgenciasApi.UrgenciaDental;
  nombrePaciente: string;
}

// ============================================================
// VALORES INICIALES
// ============================================================

const formularioUrgenciaInicial: UrgenciaFormulario = {
  idPaciente: "",
  idHistoria: "",
  tipoUrgencia: "",
  descripcion: "",
  estado: "ACTIVA",
};

const formularioExtranjeroInicial: ExtranjeroFormulario = {
  idPaciente: "",
  nacionalidad: "",
  tipoDocumento: "PASAPORTE",
  numeroDocumento: "",
  cobertura: "PARTICULAR",
  especialidad: "",
  estadoCobertura: "PENDIENTE",
  cartaGarantia: "NO_SOLICITADA",
  observaciones: "",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function CasosEspeciales() {
  const [mensajeExito, setMensajeExito] = useState<string>("");
  // ============================================================
  // MÓDULO ACTIVO
  // ============================================================

  const [moduloActivo, setModuloActivo] =
    useState<ModuloEspecial>("urgencias");

  // ============================================================
  // ESTADOS GENERALES
  // ============================================================

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================================
  // U01 - URGENCIAS
  // ============================================================

  const [urgencias, setUrgencias] =
    useState<urgenciasApi.UrgenciaDental[]>([]);

  const [pacientes, setPacientes] =
    useState<Paciente[]>([]);

  const [historias, setHistorias] =
    useState<HistoriaSeleccionada[]>([]);

  const [historiaSeleccionada, setHistoriaSeleccionada] =
    useState<HistoriaSeleccionada | null>(null);

  const [cargandoHistoria, setCargandoHistoria] =
    useState(false);

  const [formularioUrgencia, setFormularioUrgencia] =
    useState<UrgenciaFormulario>(
      formularioUrgenciaInicial
    );

  const [urgenciaSeleccionada, setUrgenciaSeleccionada] =
    useState<urgenciasApi.UrgenciaDental | null>(null);

  const [filtroUrgencia, setFiltroUrgencia] =
    useState<"TODAS" | EstadoUrgencia>("TODAS");

  // ============================================================
  // PACIENTES EXTRANJEROS
  // ============================================================

  const [extranjeros, setExtranjeros] =
    useState<
      pacientesExtranjerosApi.PacienteExtranjero[]
    >([]);

  const [
    extranjeroSeleccionado,
    setExtranjeroSeleccionado,
  ] =
    useState<
      pacientesExtranjerosApi.PacienteExtranjero | null
    >(null);

  const [
    formularioExtranjero,
    setFormularioExtranjero,
  ] =
    useState<ExtranjeroFormulario>(
      formularioExtranjeroInicial
    );

  const [busquedaExtranjero, setBusquedaExtranjero] =
    useState("");

  // ============================================================
  // MODAL
  // ============================================================

  const [modal, setModal] =
    useState<ModalTipo>(null);

  const [guardando, setGuardando] =
    useState(false);

  // ============================================================
  // U02 - URGENCIAS DUPLICADAS
  // ============================================================

  const [duplicados, setDuplicados] =
    useState<DuplicadoDetectado[]>([]);

  const [buscandoDuplicados, setBuscandoDuplicados] =
    useState(false);

  const [duplicadoSeleccionado, setDuplicadoSeleccionado] =
    useState<DuplicadoDetectado | null>(null);

  const [duplicadosDescartados, setDuplicadosDescartados] =
    useState<Set<string>>(new Set());

  const [
    analisisDuplicadosEjecutado,
    setAnalisisDuplicadosEjecutado,
  ] = useState(false);

  const [revisionesDuplicidad, setRevisionesDuplicidad] =
    useState<duplicadosApi.RevisionDuplicidad[]>([]);
  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    void cargarDatosIniciales();
  }, []);

  async function cargarDatosIniciales() {
    try {
      setCargando(true);
      setError("");

      const [
        resultadoPacientes,
        resultadoUrgencias,
        resultadoExtranjeros,
      ] = await Promise.allSettled([
        pacientesApi.list(),
        urgenciasApi.listarUrgencias(),
        pacientesExtranjerosApi.listarPacientesExtranjeros(),
      ]);

      const listadoPacientes =
        resultadoPacientes.status === "fulfilled"
          ? resultadoPacientes.value
          : [];

      const listadoUrgencias =
        resultadoUrgencias.status === "fulfilled"
          ? resultadoUrgencias.value
          : [];

      const listadoExtranjeros =
        resultadoExtranjeros.status === "fulfilled"
          ? resultadoExtranjeros.value
          : [];

      if (
        resultadoExtranjeros.status ===
        "rejected"
      ) {
        const mensaje =
          resultadoExtranjeros.reason instanceof Error
            ? resultadoExtranjeros.reason.message
            : "No se pudo cargar el módulo de pacientes extranjeros.";

        setError(
          `Pacientes Extranjeros: ${mensaje}`
        );
      }

      // ========================================================
      // PACIENTES
      // ========================================================

      const pacientesNormalizados: Paciente[] =
        (
          Array.isArray(listadoPacientes)
            ? listadoPacientes
            : []
        ).map((item) => {
          const paciente = item as {
            idPaciente?: unknown;
            nombres?: unknown;
            apellidos?: unknown;
            documento?: unknown;
            telefono?: unknown;
            correo?: unknown;
          };

          return {
            idPaciente:
              typeof paciente.idPaciente ===
                "number"
                ? paciente.idPaciente
                : Number(
                  paciente.idPaciente
                ),

            nombres:
              typeof paciente.nombres ===
                "string"
                ? paciente.nombres
                : "",

            apellidos:
              typeof paciente.apellidos ===
                "string"
                ? paciente.apellidos
                : "",

            documento:
              typeof paciente.documento ===
                "string"
                ? paciente.documento
                : "",

            telefono:
              typeof paciente.telefono ===
                "string"
                ? paciente.telefono
                : undefined,

            correo:
              typeof paciente.correo ===
                "string"
                ? paciente.correo
                : undefined,
          };
        });

      setPacientes(
        pacientesNormalizados
      );

      // ========================================================
      // URGENCIAS
      // ========================================================

      setUrgencias(
        Array.isArray(listadoUrgencias)
          ? listadoUrgencias
          : []
      );

      // ========================================================
      // EXTRANJEROS
      // ========================================================

      setExtranjeros(
        Array.isArray(listadoExtranjeros)
          ? listadoExtranjeros
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los casos especiales"
      );
    } finally {
      setCargando(false);
    }
  }

  // ============================================================
  // U01 - CARGAR HISTORIA DEL PACIENTE
  // ============================================================

  async function cargarHistoriaPaciente(
    id: number
  ) {
    try {
      setCargandoHistoria(true);
      setHistoriaSeleccionada(null);
      setHistorias([]);

      const listado: HistoriaClinicaResponse[] =
        await historiasApi.list();

      const encontradas: HistoriaSeleccionada[] =
        listado
          .filter(
            (historia) =>
              historia.paciente?.idPaciente ===
              id
          )
          .map((historia) => ({
            idHistoria:
              historia.idHistoria,

            codigoHistoria:
              historia.codigoHistoria ||
              `HC-${String(
                historia.idHistoria
              ).padStart(4, "0")}`,
          }))
          .filter((historia) =>
            Number.isFinite(
              historia.idHistoria
            )
          );

      setHistorias(encontradas);

      if (encontradas.length > 0) {
        const primera = encontradas[0];

        if (!primera) {
          return;
        }

        setHistoriaSeleccionada(
          primera
        );

        setFormularioUrgencia(
          (actual) => ({
            ...actual,
            idHistoria:
              primera.idHistoria,
          })
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la historia clínica"
      );
    } finally {
      setCargandoHistoria(false);
    }
  }

  // ============================================================
  // U01 - CAMBIO DE PACIENTE
  // ============================================================

  async function cambiarPacienteUrgencia(
    idPaciente: number
  ) {
    setFormularioUrgencia(
      (actual) => ({
        ...actual,
        idPaciente,
        idHistoria: "",
      })
    );

    await cargarHistoriaPaciente(
      idPaciente
    );
  }

  // ============================================================
  // U01 - ESTADÍSTICAS
  // ============================================================

  const urgenciasActivas = useMemo(
    () =>
      urgencias.filter(
        (item) =>
          item.estado === "ACTIVA"
      ).length,
    [urgencias]
  );

  const urgenciasEnAtencion = useMemo(
    () =>
      urgencias.filter(
        (item) =>
          item.estado ===
          "EN_ATENCION"
      ).length,
    [urgencias]
  );

  const urgenciasResueltas = useMemo(
    () =>
      urgencias.filter(
        (item) =>
          item.estado ===
          "RESUELTA"
      ).length,
    [urgencias]
  );

  const urgenciasFiltradas = useMemo(
    () => {
      if (
        filtroUrgencia === "TODAS"
      ) {
        return urgencias;
      }

      return urgencias.filter(
        (item) =>
          item.estado ===
          filtroUrgencia
      );
    },
    [urgencias, filtroUrgencia]
  );

  // ============================================================
  // PACIENTES EXTRANJEROS YA REGISTRADOS
  // ============================================================

  const pacientesExtranjerosIds =
    useMemo(
      () =>
        new Set(
          extranjeros.map(
            (item) =>
              item.paciente
                .idPaciente
          )
        ),
      [extranjeros]
    );

  const pacientesDisponiblesParaExtranjero =
    useMemo(
      () =>
        pacientes.filter(
          (paciente) =>
            !pacientesExtranjerosIds.has(
              paciente.idPaciente
            )
        ),
      [
        pacientes,
        pacientesExtranjerosIds,
      ]
    );

  // ============================================================
  // FILTRADO DE EXTRANJEROS
  // ============================================================

  const extranjerosFiltrados =
    useMemo(() => {
      const texto =
        busquedaExtranjero
          .trim()
          .toLowerCase();

      if (!texto) {
        return extranjeros;
      }

      return extranjeros.filter(
        (item) => {
          const nombre =
            `${item.paciente.nombres} ${item.paciente.apellidos}`.toLowerCase();

          return (
            nombre.includes(texto) ||
            item.paciente.documento
              .toLowerCase()
              .includes(texto) ||
            item.numeroDocumento
              .toLowerCase()
              .includes(texto) ||
            item.nacionalidad
              .toLowerCase()
              .includes(texto)
          );
        }
      );
    }, [
      extranjeros,
      busquedaExtranjero,
    ]);

  // ============================================================
  // U01 - PRESELECCIÓN DE TRIAJE
  // ============================================================

  function registrarTipoUrgencia(
    tipo: string,
    descripcion: string
  ) {
    setError("");
    setUrgenciaSeleccionada(null);
    setHistorias([]);
    setHistoriaSeleccionada(null);

    setFormularioUrgencia({
      ...formularioUrgenciaInicial,
      tipoUrgencia: tipo,
      descripcion,
    });

    setModal("urgencia-nueva");
  }

  // ============================================================
  // U01 - ABRIR NUEVA URGENCIA
  // ============================================================

  function abrirNuevaUrgencia() {
    setError("");
    setUrgenciaSeleccionada(null);
    setHistorias([]);
    setHistoriaSeleccionada(null);

    setFormularioUrgencia({
      ...formularioUrgenciaInicial,
    });

    setModal("urgencia-nueva");
  }

  // ============================================================
  // U01 - VER
  // ============================================================

  function abrirVerUrgencia(
    urgencia: urgenciasApi.UrgenciaDental
  ) {
    setError("");
    setUrgenciaSeleccionada(
      urgencia
    );
    setModal("urgencia-ver");
  }

  // ============================================================
  // U01 - EDITAR
  // ============================================================

  function abrirEditarUrgencia(
    urgencia: urgenciasApi.UrgenciaDental
  ) {
    setError("");
    setUrgenciaSeleccionada(
      urgencia
    );

    setFormularioUrgencia({
      idPaciente:
        urgencia.paciente
          .idPaciente,

      idHistoria:
        urgencia.historiaClinica
          .idHistoria,

      tipoUrgencia:
        urgencia.tipoUrgencia,

      descripcion:
        urgencia.descripcion,

      estado:
        urgencia.estado,
    });

    setHistorias([
      {
        idHistoria:
          urgencia.historiaClinica
            .idHistoria,

        codigoHistoria:
          urgencia.historiaClinica
            .codigoHistoria,
      },
    ]);

    setHistoriaSeleccionada({
      idHistoria:
        urgencia.historiaClinica
          .idHistoria,

      codigoHistoria:
        urgencia.historiaClinica
          .codigoHistoria,
    });

    setModal(
      "urgencia-editar"
    );
  }

  // ============================================================
  // U01 - GUARDAR
  // ============================================================

  async function guardarUrgencia(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      formularioUrgencia.idPaciente ===
      "" ||
      formularioUrgencia.idHistoria ===
      ""
    ) {
      setError(
        "Seleccione un paciente y una historia clínica."
      );
      return;
    }

    if (
      !formularioUrgencia.tipoUrgencia.trim() ||
      !formularioUrgencia.descripcion.trim()
    ) {
      setError(
        "Complete el tipo de urgencia y la descripción."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const data: urgenciasApi.UrgenciaDentalRequest =
      {
        idPaciente: Number(
          formularioUrgencia.idPaciente
        ),

        idHistoria: Number(
          formularioUrgencia.idHistoria
        ),

        tipoUrgencia:
          formularioUrgencia.tipoUrgencia.trim(),

        descripcion:
          formularioUrgencia.descripcion.trim(),

        estado:
          formularioUrgencia.estado,
      };

      if (
        modal ===
        "urgencia-editar" &&
        urgenciaSeleccionada
      ) {
        await urgenciasApi.actualizarUrgencia(
          urgenciaSeleccionada.idUrgencia,
          data
        );
      } else {
        await urgenciasApi.crearUrgencia(
          data
        );
      }

      await recargarUrgencias();

      cerrarModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la urgencia"
      );
    } finally {
      setGuardando(false);
    }
  }

  // ============================================================
  // U01 - ATENDER
  // ============================================================

  async function atenderUrgencia(
    urgencia: urgenciasApi.UrgenciaDental
  ) {
    try {
      setError("");

      await urgenciasApi.actualizarEstadoUrgencia(
        urgencia.idUrgencia,
        "EN_ATENCION"
      );

      await recargarUrgencias();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la urgencia"
      );
    }
  }

  // ============================================================
  // U01 - RESOLVER
  // ============================================================

  async function resolverUrgencia(
    urgencia: urgenciasApi.UrgenciaDental
  ) {
    try {
      setError("");

      await urgenciasApi.actualizarEstadoUrgencia(
        urgencia.idUrgencia,
        "RESUELTA"
      );

      await recargarUrgencias();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo resolver la urgencia"
      );
    }
  }

  // ============================================================
  // U01 - ELIMINAR
  // ============================================================

  async function eliminarUrgencia(
    urgencia: urgenciasApi.UrgenciaDental
  ) {
    const confirmar =
      window.confirm(
        `¿Está seguro de eliminar la urgencia "${urgencia.tipoUrgencia}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await urgenciasApi.eliminarUrgencia(
        urgencia.idUrgencia
      );

      await recargarUrgencias();

      if (
        urgenciaSeleccionada?.idUrgencia ===
        urgencia.idUrgencia
      ) {
        cerrarModal();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la urgencia"
      );
    }
  }

  // ============================================================
  // U01 - RECARGAR
  // ============================================================

  async function recargarUrgencias() {
    try {
      setError("");

      const listado =
        await urgenciasApi.listarUrgencias();

      setUrgencias(
        Array.isArray(listado)
          ? listado
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron actualizar las urgencias"
      );
    }
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - NUEVO
  // ============================================================

  function abrirNuevoExtranjero() {
    setError("");
    setExtranjeroSeleccionado(
      null
    );

    setFormularioExtranjero({
      ...formularioExtranjeroInicial,
    });

    setModal(
      "extranjero-nuevo"
    );
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - EDITAR
  // ============================================================

  function abrirEditarExtranjero(
    extranjero: pacientesExtranjerosApi.PacienteExtranjero
  ) {
    setError("");
    setExtranjeroSeleccionado(
      extranjero
    );

    setFormularioExtranjero({
      idPaciente:
        extranjero.paciente
          .idPaciente,

      nacionalidad:
        extranjero.nacionalidad,

      tipoDocumento:
        extranjero.tipoDocumento,

      numeroDocumento:
        extranjero.numeroDocumento,

      cobertura:
        extranjero.cobertura,

      especialidad:
        extranjero.especialidad ||
        "",

      estadoCobertura:
        extranjero.estadoCobertura,

      cartaGarantia:
        extranjero.cartaGarantia,

      observaciones:
        extranjero.observaciones ||
        "",
    });

    setModal(
      "extranjero-editar"
    );
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - GUARDAR
  // ============================================================

  async function guardarExtranjero(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      formularioExtranjero.idPaciente ===
      ""
    ) {
      setError(
        "Seleccione un paciente."
      );
      return;
    }

    if (
      !formularioExtranjero.nacionalidad.trim()
    ) {
      setError(
        "Ingrese la nacionalidad."
      );
      return;
    }

    if (
      !formularioExtranjero.numeroDocumento.trim()
    ) {
      setError(
        "Ingrese el número de documento."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const data: pacientesExtranjerosApi.PacienteExtranjeroRequest =
      {
        idPaciente: Number(
          formularioExtranjero.idPaciente
        ),

        nacionalidad:
          formularioExtranjero.nacionalidad.trim(),

        tipoDocumento:
          formularioExtranjero.tipoDocumento,

        numeroDocumento:
          formularioExtranjero.numeroDocumento.trim(),

        cobertura:
          formularioExtranjero.cobertura.trim() ||
          "PARTICULAR",

        especialidad:
          formularioExtranjero.especialidad.trim(),

        estadoCobertura:
          formularioExtranjero.estadoCobertura,

        cartaGarantia:
          formularioExtranjero.cartaGarantia,

        observaciones:
          formularioExtranjero.observaciones.trim(),
      };

      if (
        modal ===
        "extranjero-editar" &&
        extranjeroSeleccionado
      ) {
        await pacientesExtranjerosApi.actualizarPacienteExtranjero(
          extranjeroSeleccionado.idExtranjero,
          data
        );
      } else {
        await pacientesExtranjerosApi.crearPacienteExtranjero(
          data
        );
      }

      await recargarExtranjeros();

      cerrarModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el paciente extranjero"
      );
    } finally {
      setGuardando(false);
    }
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - VALIDAR COBERTURA
  // ============================================================

  async function validarCobertura(
    extranjero: pacientesExtranjerosApi.PacienteExtranjero
  ) {
    try {
      setError("");

      await pacientesExtranjerosApi.validarCobertura(
        extranjero.idExtranjero
      );

      await recargarExtranjeros();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo validar la cobertura"
      );
    }
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - SOLICITAR CARTA
  // ============================================================

  async function solicitarCarta(
    extranjero: pacientesExtranjerosApi.PacienteExtranjero
  ) {
    try {
      setError("");

      await pacientesExtranjerosApi.solicitarCartaGarantia(
        extranjero.idExtranjero
      );

      await recargarExtranjeros();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo solicitar la carta de garantía"
      );
    }
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - ELIMINAR
  // ============================================================

  async function eliminarExtranjero(
    extranjero: pacientesExtranjerosApi.PacienteExtranjero
  ) {
    const nombre =
      `${extranjero.paciente.nombres} ${extranjero.paciente.apellidos}`;

    const confirmar =
      window.confirm(
        `¿Está seguro de eliminar el registro de "${nombre}" como paciente extranjero?`
      );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await pacientesExtranjerosApi.eliminarPacienteExtranjero(
        extranjero.idExtranjero
      );

      await recargarExtranjeros();

      if (
        extranjeroSeleccionado?.idExtranjero ===
        extranjero.idExtranjero
      ) {
        setExtranjeroSeleccionado(
          null
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el registro"
      );
    }
  }

  // ============================================================
  // PACIENTES EXTRANJEROS - RECARGAR
  // ============================================================

  async function recargarExtranjeros() {
    try {
      setError("");

      const listado =
        await pacientesExtranjerosApi.listarPacientesExtranjeros();

      setExtranjeros(
        Array.isArray(listado)
          ? listado
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron actualizar los pacientes extranjeros"
      );
    }
  }

  // ============================================================
  // U02 - BUSCAR URGENCIAS DUPLICADAS
  // ============================================================


  async function buscarDuplicados() {
    try {
      setBuscandoDuplicados(true);
      setError("");
      setDuplicadoSeleccionado(null);

      const [listado, revisiones] = await Promise.all([
        urgenciasApi.listarUrgencias(),
        duplicadosApi.listarRevisionesDuplicidad(),
      ]);

      const urgenciasValidas: urgenciasApi.UrgenciaDental[] =
        Array.isArray(listado) ? listado : [];

      setRevisionesDuplicidad(
        Array.isArray(revisiones) ? revisiones : []
      );

      const grupos = new Map<
        string,
        urgenciasApi.UrgenciaDental[]
      >();

      urgenciasValidas.forEach((urgencia) => {
        const idPaciente = urgencia.paciente?.idPaciente;
        const idHistoria = urgencia.historiaClinica?.idHistoria;

        if (
          typeof idPaciente !== "number" ||
          !Number.isFinite(idPaciente) ||
          typeof idHistoria !== "number" ||
          !Number.isFinite(idHistoria)
        ) {
          return;
        }

        const claveGrupo = `${idPaciente}-${idHistoria}`;
        const existentes = grupos.get(claveGrupo) ?? [];

        existentes.push(urgencia);
        grupos.set(claveGrupo, existentes);
      });

      const detectados: DuplicadoDetectado[] = [];

      grupos.forEach((urgenciasPacienteHistoria) => {
        if (urgenciasPacienteHistoria.length < 2) {
          return;
        }

        const ordenadas = [...urgenciasPacienteHistoria].sort(
          (a, b) => a.idUrgencia - b.idUrgencia
        );

        const original = ordenadas[0];

        if (!original) {
          return;
        }

        const nombrePaciente =
          `${original.paciente.nombres} ${original.paciente.apellidos}`.trim();

        for (let index = 1; index < ordenadas.length; index += 1) {
          const duplicado = ordenadas[index];

          if (!duplicado) {
            continue;
          }

          detectados.push({
            clave: `${original.idUrgencia}-${duplicado.idUrgencia}`,
            original,
            duplicado,
            nombrePaciente,
          });
        }
      });

      setDuplicados(detectados);
      setDuplicadosDescartados(new Set());
      setAnalisisDuplicadosEjecutado(true);
    } catch (err) {
      setAnalisisDuplicadosEjecutado(false);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron analizar las urgencias duplicadas."
      );
    } finally {
      setBuscandoDuplicados(false);
    }
  }
  // ============================================================
  // U02 - DUPLICADOS VISIBLES
  // ============================================================

  const duplicadosVisibles = useMemo(
    () =>
      duplicados.filter((item) => {
        const yaDescartado = duplicadosDescartados.has(
          item.clave
        );

        const yaRevisado = revisionesDuplicidad.some(
          (revision) =>
            (
              revision.idUrgenciaOriginal ===
              item.original.idUrgencia &&
              revision.idUrgenciaDuplicada ===
              item.duplicado.idUrgencia
            ) ||
            (
              revision.idUrgenciaOriginal ===
              item.duplicado.idUrgencia &&
              revision.idUrgenciaDuplicada ===
              item.original.idUrgencia
            )
        );

        return !yaDescartado && !yaRevisado;
      }),
    [
      duplicados,
      duplicadosDescartados,
      revisionesDuplicidad,
    ]
  );
  // ============================================================
  // U02 - VER DETALLE
  // ============================================================

  function abrirDetalleDuplicado(
    duplicado: DuplicadoDetectado
  ) {
    setError("");
    setDuplicadoSeleccionado(
      duplicado
    );
    setModal(
      "duplicado-ver"
    );
  }

  // ============================================================
  // U02 - MARCAR COMO NO DUPLICADO
  // ============================================================

  function marcarNoDuplicado(
    duplicado: DuplicadoDetectado
  ) {
    setDuplicadosDescartados(
      (actual) => {
        const siguiente =
          new Set(actual);

        siguiente.add(
          duplicado.clave
        );

        return siguiente;
      }
    );

    setError("");
  }

  // ============================================================
  // U02 - FUSIÓN
  // ============================================================

  async function solicitarFusion(
    duplicado: DuplicadoDetectado
  ) {
    const idOriginal = duplicado.original.idUrgencia;
    const idDuplicada = duplicado.duplicado.idUrgencia;

    try {
      setError("");

      await duplicadosApi.registrarRevisionDuplicidad(
        idOriginal,
        idDuplicada
      );

      const revisionesActualizadas =
        await duplicadosApi.listarRevisionesDuplicidad();

      setRevisionesDuplicidad(revisionesActualizadas);

      setMensajeExito(
        `La revisión de las urgencias URG-${String(idOriginal).padStart(4, "0")} y URG-${String(idDuplicada).padStart(4, "0")} se registró correctamente. Ambos registros clínicos se conservaron.`
      );
    } catch (err) {
      // Si el servidor informa que la pareja ya fue revisada,
      // actualizar la lista con los datos persistidos.
      try {
        setMensajeExito("");
        setError("");
      } catch {
        // Se conserva el error original para mostrarlo al usuario.
      }

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la revisión de duplicidad."
      );
    }
  }
  // ============================================================
  // CERRAR MODAL
  // ============================================================

  function cerrarModal() {
    setModal(null);

    setUrgenciaSeleccionada(
      null
    );

    setExtranjeroSeleccionado(
      null
    );

    setDuplicadoSeleccionado(
      null
    );

    setHistorias([]);

    setHistoriaSeleccionada(
      null
    );

    setFormularioUrgencia({
      ...formularioUrgenciaInicial,
    });

    setFormularioExtranjero({
      ...formularioExtranjeroInicial,
    });
  }

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  function formatearFecha(
    fecha?: string
  ) {
    if (!fecha) {
      return "Sin fecha";
    }

    try {
      return new Date(
        fecha
      ).toLocaleString(
        "es-PE",
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      );
    } catch {
      return fecha;
    }
  }

  // ============================================================
  // ETIQUETAS
  // ============================================================

  function etiquetaEstadoUrgencia(
    estado: EstadoUrgencia
  ) {
    switch (estado) {
      case "ACTIVA":
        return "Activa";

      case "EN_ATENCION":
        return "En atención";

      case "RESUELTA":
        return "Resuelta";

      default:
        return estado;
    }
  }

  function etiquetaTipoDocumento(
    tipo: TipoDocumentoExtranjero
  ) {
    return tipo ===
      "PASAPORTE"
      ? "Pasaporte"
      : "Carné de Extranjería";
  }

  function etiquetaCobertura(
    estado: EstadoCobertura
  ) {
    switch (estado) {
      case "VALIDADA":
        return "Cobertura Validada";

      case "RECHAZADA":
        return "Cobertura Rechazada";

      default:
        return "Cobertura Pendiente";
    }
  }

  function etiquetaCarta(
    estado: EstadoCartaGarantia
  ) {
    switch (estado) {
      case "SOLICITADA":
        return "Carta Solicitada";

      case "RECIBIDA":
        return "Carta Recibida";

      default:
        return "Carta No Solicitada";
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (cargando) {
    return (
      <div className="casos-especiales">
        <div className="casos-especiales-loading">
          <div className="casos-loading-spinner" />
          <p>
            Cargando casos especiales...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // TARJETAS DE TRIAJE
  // ============================================================

  const tarjetasTriaje = [
    {
      icono: "🦷",
      titulo: "Dolor Agudo",
      descripcion:
        "Dolor dental severo — pulpitis o absceso",
      tipo: "Dolor Agudo",
    },
    {
      icono: "🩹",
      titulo: "Absceso Dental",
      descripcion:
        "Inflamación purulenta — requiere drenaje",
      tipo: "Absceso Dental",
    },
    {
      icono: "⚡",
      titulo: "Trauma Dental",
      descripcion:
        "Fractura, avulsión o luxación dentaria",
      tipo: "Trauma Dental",
    },
    {
      icono: "🩸",
      titulo: "Hemorragia Post-op",
      descripcion:
        "Sangrado tras extracción o cirugía oral",
      tipo: "Hemorragia Post-op",
    },
    {
      icono: "💥",
      titulo: "Fractura Coronaria",
      descripcion:
        "Fractura de corona visible sin compromiso pulpar",
      tipo: "Fractura Coronaria",
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="casos-especiales">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="casos-header">
        <div className="casos-header-content">

          <div
            className="casos-header-icon"
            aria-hidden="true"
          >
            CE
          </div>

          <div>
            <span className="casos-eyebrow">
              CASOS ESPECIALES
            </span>

            <h1>
              Urgencias Dentales y Casos Especiales
            </h1>

            <p>
              U01-U02: Triaje dental,
              pacientes extranjeros y
              gestión de duplicados
            </p>
          </div>

        </div>
      </header>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="casos-error">
          <div>
            <strong>
              REQUEST_ERROR
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="casos-error-close"
          >
            ×
          </button>
        </div>
      )}

      {mensajeExito && (
        <div className="casos-alerta-exito" role="status">
          <span className="casos-alerta-icono">✓</span>

          <div className="casos-alerta-contenido">
            <strong>Revisión completada</strong>
            <p>{mensajeExito}</p>
          </div>

          <button
            type="button"
            className="casos-alerta-cerrar"
            onClick={() => setMensajeExito("")}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}

      {/* ======================================================
          TABS
      ====================================================== */}

      <nav
        className="casos-tabs"
        aria-label="Módulos de casos especiales"
      >

        <button
          type="button"
          className={
            moduloActivo ===
              "urgencias"
              ? "casos-tab active"
              : "casos-tab"
          }
          onClick={() =>
            setModuloActivo(
              "urgencias"
            )
          }
        >
          <span className="casos-tab-icon">
            U01
          </span>

          <span>
            Urgencias Dentales (U01)
          </span>
        </button>

        <button
          type="button"
          className={
            moduloActivo ===
              "extranjeros"
              ? "casos-tab active"
              : "casos-tab"
          }
          onClick={() =>
            setModuloActivo(
              "extranjeros"
            )
          }
        >
          <span className="casos-tab-icon">
            INT
          </span>

          <span>
            Pacientes Extranjeros
          </span>
        </button>

        <button
          type="button"
          className={
            moduloActivo ===
              "duplicados"
              ? "casos-tab active"
              : "casos-tab"
          }
          onClick={() =>
            setModuloActivo(
              "duplicados"
            )
          }
        >
          <span className="casos-tab-icon">
            U02
          </span>

          <span>
            Urgencias Duplicadas (U02)
          </span>
        </button>

      </nav>

      <div className="casos-panel-window">

        {/* ====================================================
            U01 - URGENCIAS
        ==================================================== */}

        {moduloActivo ===
          "urgencias" && (
            <section className="casos-section">

              <div className="casos-section-header">
                <div>
                  <span className="casos-section-kicker">
                    U01 · TRIAJE
                  </span>

                  <h2>
                    Triaje Dental de Urgencias
                  </h2>

                  <p>
                    Clasificación inicial de
                    situaciones odontológicas
                    que requieren atención
                    prioritaria.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    abrirNuevaUrgencia
                  }
                >
                  Registrar Urgencia Dental
                </button>
              </div>

              {/* TRIAJE */}

              <div className="triaje-grid">

                {tarjetasTriaje.map(
                  (tarjeta) => (
                    <article
                      className="triaje-card"
                      key={tarjeta.tipo}
                    >

                      <div className="triaje-card-icon">
                        {tarjeta.icono}
                      </div>

                      <div className="triaje-card-content">

                        <h3>
                          {tarjeta.titulo}
                        </h3>

                        <p>
                          {tarjeta.descripcion}
                        </p>

                      </div>

                      <button
                        type="button"
                        className="triage-button"
                        onClick={() =>
                          registrarTipoUrgencia(
                            tarjeta.tipo,
                            tarjeta.descripcion
                          )
                        }
                      >
                        Atender
                      </button>

                    </article>
                  )
                )}

              </div>

              {/* LISTADO DE URGENCIAS */}

              <div className="casos-subsection">

                <div className="casos-subsection-header">

                  <div>

                    <span className="casos-section-kicker">
                      ATENCIÓN
                    </span>

                    <h3>
                      Pacientes en Urgencia Activa
                    </h3>

                    <p>
                      Casos registrados
                      actualmente en el sistema.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      recargarUrgencias
                    }
                  >
                    Actualizar
                  </button>

                </div>

                <div className="casos-contadores">

                  <button
                    type="button"
                    className={
                      filtroUrgencia ===
                        "TODAS"
                        ? "caso-contador active"
                        : "caso-contador"
                    }
                    onClick={() =>
                      setFiltroUrgencia(
                        "TODAS"
                      )
                    }
                  >
                    <span className="caso-contador-label">
                      Total
                    </span>

                    <strong>
                      {urgencias.length}
                    </strong>
                  </button>

                  <button
                    type="button"
                    className={
                      filtroUrgencia ===
                        "ACTIVA"
                        ? "caso-contador active"
                        : "caso-contador"
                    }
                    onClick={() =>
                      setFiltroUrgencia(
                        "ACTIVA"
                      )
                    }
                  >
                    <span className="caso-contador-label">
                      Activas
                    </span>

                    <strong>
                      {urgenciasActivas}
                    </strong>
                  </button>

                  <button
                    type="button"
                    className={
                      filtroUrgencia ===
                        "EN_ATENCION"
                        ? "caso-contador active"
                        : "caso-contador"
                    }
                    onClick={() =>
                      setFiltroUrgencia(
                        "EN_ATENCION"
                      )
                    }
                  >
                    <span className="caso-contador-label">
                      En atención
                    </span>

                    <strong>
                      {urgenciasEnAtencion}
                    </strong>
                  </button>

                  <button
                    type="button"
                    className={
                      filtroUrgencia ===
                        "RESUELTA"
                        ? "caso-contador active"
                        : "caso-contador"
                    }
                    onClick={() =>
                      setFiltroUrgencia(
                        "RESUELTA"
                      )
                    }
                  >
                    <span className="caso-contador-label">
                      Resueltas
                    </span>

                    <strong>
                      {urgenciasResueltas}
                    </strong>
                  </button>

                </div>

                {urgenciasFiltradas.length ===
                  0 ? (
                  <div className="casos-empty">

                    <div className="casos-empty-icon">
                      U01
                    </div>

                    <h3>
                      No hay urgencias registradas
                    </h3>

                    <p>
                      No existen registros
                      para el filtro seleccionado.
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        abrirNuevaUrgencia
                      }
                    >
                      Registrar urgencia
                    </button>

                  </div>
                ) : (
                  <div className="casos-lista">

                    {urgenciasFiltradas.map(
                      (urgencia) => (
                        <article
                          key={
                            urgencia.idUrgencia
                          }
                          className="urgencia-card"
                        >

                          <div className="urgencia-card-top">

                            <div>

                              <span className="urgencia-id">
                                URG-
                                {String(
                                  urgencia.idUrgencia
                                ).padStart(
                                  4,
                                  "0"
                                )}
                              </span>

                              <h3>
                                {
                                  urgencia.tipoUrgencia
                                }
                              </h3>

                            </div>

                            <span
                              className={`estado-badge estado-${urgencia.estado.toLowerCase()}`}
                            >
                              {etiquetaEstadoUrgencia(
                                urgencia.estado
                              )}
                            </span>

                          </div>

                          <div className="urgencia-card-body">

                            <div className="urgencia-dato">
                              <span>
                                Paciente
                              </span>

                              <strong>
                                {
                                  urgencia
                                    .paciente
                                    .nombres
                                }{" "}
                                {
                                  urgencia
                                    .paciente
                                    .apellidos
                                }
                              </strong>

                              <small>
                                Documento:{" "}
                                {
                                  urgencia
                                    .paciente
                                    .documento
                                }
                              </small>
                            </div>

                            <div className="urgencia-dato">
                              <span>
                                Historia clínica
                              </span>

                              <strong>
                                {
                                  urgencia
                                    .historiaClinica
                                    .codigoHistoria
                                }
                              </strong>
                            </div>

                            <div className="urgencia-dato">
                              <span>
                                Fecha de registro
                              </span>

                              <strong>
                                {formatearFecha(
                                  urgencia.fechaRegistro
                                )}
                              </strong>
                            </div>

                          </div>

                          <div className="urgencia-descripcion">

                            <span>
                              Descripción
                            </span>

                            <p>
                              {
                                urgencia.descripcion
                              }
                            </p>

                          </div>

                          <div className="urgencia-actions">

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                abrirVerUrgencia(
                                  urgencia
                                )
                              }
                            >
                              Ver
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                abrirEditarUrgencia(
                                  urgencia
                                )
                              }
                            >
                              Editar
                            </button>

                            {urgencia.estado ===
                              "ACTIVA" && (
                                <button
                                  type="button"
                                  className="btn btn-warning"
                                  onClick={() =>
                                    atenderUrgencia(
                                      urgencia
                                    )
                                  }
                                >
                                  Atender
                                </button>
                              )}

                            {urgencia.estado ===
                              "EN_ATENCION" && (
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={() =>
                                    resolverUrgencia(
                                      urgencia
                                    )
                                  }
                                >
                                  Resolver
                                </button>
                              )}

                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() =>
                                eliminarUrgencia(
                                  urgencia
                                )
                              }
                            >
                              Eliminar
                            </button>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                )}

              </div>
            </section>
          )}

        {/* ====================================================
            PACIENTES EXTRANJEROS
        ==================================================== */}

        {moduloActivo ===
          "extranjeros" && (
            <section className="casos-section">

              <div className="casos-section-header">

                <div>

                  <span className="casos-section-kicker">
                    CASO ESPECIAL
                  </span>

                  <h2>
                    Pacientes Extranjeros
                  </h2>

                  <p>
                    Gestión de cobertura
                    internacional, pasaportes
                    y carné de extranjería
                  </p>

                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    abrirNuevoExtranjero
                  }
                >
                  Registro Rápido —
                  Paciente Extranjero
                </button>

              </div>

              <div className="casos-extranjeros-toolbar">

                <div className="casos-search">

                  <label htmlFor="buscar-extranjero">
                    Buscar paciente
                  </label>

                  <input
                    id="buscar-extranjero"
                    type="text"
                    value={
                      busquedaExtranjero
                    }
                    onChange={(event) =>
                      setBusquedaExtranjero(
                        event.target.value
                      )
                    }
                    placeholder="Nombre, documento o nacionalidad..."
                  />

                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    recargarExtranjeros
                  }
                >
                  Actualizar
                </button>

              </div>

              <div className="casos-subsection">

                <div className="casos-subsection-header">

                  <div>

                    <span className="casos-section-kicker">
                      REGISTRO INTERNACIONAL
                    </span>

                    <h3>
                      Pacientes Extranjeros
                    </h3>

                    <p>
                      Gestione identificación,
                      cobertura y documentación
                      internacional.
                    </p>

                  </div>

                </div>

                {extranjerosFiltrados.length ===
                  0 ? (
                  <div className="casos-empty">

                    <div className="casos-empty-icon">
                      INT
                    </div>

                    <h3>
                      No hay pacientes extranjeros
                    </h3>

                    <p>
                      No existen registros
                      que coincidan con la
                      búsqueda.
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        abrirNuevoExtranjero
                      }
                    >
                      Registro Rápido —
                      Paciente Extranjero
                    </button>

                  </div>
                ) : (
                  <div className="casos-lista extranjeros-lista">

                    {extranjerosFiltrados.map(
                      (extranjero) => (
                        <article
                          key={
                            extranjero.idExtranjero
                          }
                          className="extranjero-card"
                        >

                          <div className="extranjero-card-header">

                            <div>

                              <span className="extranjero-codigo">
                                ODAM-
                                {String(
                                  extranjero.idExtranjero
                                ).padStart(
                                  8,
                                  "0"
                                )}
                              </span>

                              <h3>
                                {
                                  extranjero
                                    .paciente
                                    .nombres
                                }{" "}
                                {
                                  extranjero
                                    .paciente
                                    .apellidos
                                }
                              </h3>

                              <span className="extranjero-paciente">
                                Historia de
                                paciente #
                                {
                                  extranjero
                                    .paciente
                                    .idPaciente
                                }
                              </span>

                            </div>

                            <div className="extranjero-documento">

                              <span>
                                {
                                  extranjero.nacionalidad
                                }
                              </span>

                              <strong>
                                {etiquetaTipoDocumento(
                                  extranjero.tipoDocumento
                                )}
                                :{" "}
                                {
                                  extranjero.numeroDocumento
                                }
                              </strong>

                            </div>

                          </div>

                          <div className="extranjero-card-body">

                            <div className="extranjero-dato">
                              <span>
                                Cobertura
                              </span>

                              <strong>
                                {
                                  extranjero.cobertura
                                }
                              </strong>
                            </div>

                            <div className="extranjero-dato">
                              <span>
                                Especialidad
                              </span>

                              <strong>
                                {
                                  extranjero.especialidad ||
                                  "No especificada"
                                }
                              </strong>
                            </div>

                            <div className="extranjero-dato">
                              <span>
                                Documento nacional
                              </span>

                              <strong>
                                {
                                  extranjero
                                    .paciente
                                    .documento
                                }
                              </strong>
                            </div>

                          </div>

                          <div className="extranjero-estados">

                            <span
                              className={
                                extranjero.estadoCobertura ===
                                  "VALIDADA"
                                  ? "estado-badge estado-validada"
                                  : extranjero.estadoCobertura ===
                                    "RECHAZADA"
                                    ? "estado-badge estado-rechazada"
                                    : "estado-badge estado-pendiente"
                              }
                            >
                              {etiquetaCobertura(
                                extranjero.estadoCobertura
                              )}
                            </span>

                            <span
                              className={
                                extranjero.cartaGarantia ===
                                  "RECIBIDA"
                                  ? "estado-badge estado-validada"
                                  : extranjero.cartaGarantia ===
                                    "SOLICITADA"
                                    ? "estado-badge estado-atencion"
                                    : "estado-badge estado-pendiente"
                              }
                            >
                              {etiquetaCarta(
                                extranjero.cartaGarantia
                              )}
                            </span>

                          </div>

                          <div className="extranjero-actions">

                            {extranjero.estadoCobertura !==
                              "VALIDADA" && (
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={() =>
                                    validarCobertura(
                                      extranjero
                                    )
                                  }
                                >
                                  Validar Cobertura
                                </button>
                              )}

                            {extranjero.cartaGarantia ===
                              "NO_SOLICITADA" && (
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() =>
                                    solicitarCarta(
                                      extranjero
                                    )
                                  }
                                >
                                  Solicitar Carta
                                  de Garantía
                                </button>
                              )}

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                abrirEditarExtranjero(
                                  extranjero
                                )
                              }
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() =>
                                eliminarExtranjero(
                                  extranjero
                                )
                              }
                            >
                              Eliminar
                            </button>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                )}

              </div>
            </section>
          )}

        {/* ====================================================
            U02 - URGENCIAS DUPLICADAS
        ==================================================== */}

        {moduloActivo ===
          "duplicados" && (
            <section className="casos-section">

              <div className="casos-section-header">

                <div>

                  <span className="casos-section-kicker">
                    U02 · CONTROL DE CALIDAD
                  </span>

                  <h2>
                    Detección de Urgencias Duplicadas
                  </h2>

                  <p>
                    Identifique registros de
                    urgencias repetidos para
                    un mismo paciente e historia
                    clínica y revise posibles
                    duplicados.
                  </p>

                </div>

              </div>

              <div className="u02-control">

                <div className="u02-control-header">

                  <div className="u02-control-title">

                    <span className="u02-control-kicker">
                      CONTROL DE URGENCIAS
                    </span>

                    <h3>
                      Análisis de duplicados
                    </h3>

                    <p>
                      El sistema compara las
                      urgencias registradas
                      utilizando el paciente y
                      la historia clínica
                      asociados. Si existen dos
                      o más urgencias para la
                      misma combinación, se
                      muestran para revisión
                      antes de realizar cualquier
                      acción.
                    </p>

                  </div>

                  <div className="u02-control-button">

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        buscarDuplicados
                      }
                      disabled={
                        buscandoDuplicados
                      }
                    >
                      {buscandoDuplicados
                        ? "Analizando..."
                        : "Buscar duplicados"}
                    </button>

                  </div>

                </div>

                <div className="u02-info">

                  <span className="u02-info-label">
                    Criterio de revisión
                  </span>

                  <p>
                    Se agrupan las urgencias
                    por paciente e historia
                    clínica. Cuando existen
                    dos o más registros para
                    la misma combinación,
                    el primero se conserva
                    como original y los
                    siguientes se presentan
                    como posibles duplicados
                    para revisión administrativa.
                  </p>

                </div>

                <div className="u02-stats">

                  <div className="u02-stat">

                    <span className="u02-stat-number">
                      {duplicados.length}
                    </span>

                    <span className="u02-stat-label">
                      Duplicados detectados
                    </span>

                  </div>

                  <div className="u02-stat">

                    <span className="u02-stat-number">
                      {
                        duplicadosDescartados.size
                      }
                    </span>

                    <span className="u02-stat-label">
                      Duplicados descartados
                    </span>

                  </div>

                  <div className="u02-stat">

                    <span className="u02-stat-number">
                      {
                        duplicadosVisibles.length
                      }
                    </span>

                    <span className="u02-stat-label">
                      Por revisar
                    </span>

                  </div>

                </div>

                {/* SIN ANÁLISIS */}

                {!analisisDuplicadosEjecutado ? (
                  <div className="u02-analysis">

                    <div className="u02-analysis-code">
                      U02
                    </div>

                    <div className="u02-analysis-icon">
                      !
                    </div>

                    <h3>
                      No se ha ejecutado el análisis
                    </h3>

                    <p>
                      Presione &quot;Buscar
                      duplicados&quot; para
                      analizar las urgencias
                      registradas.
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        buscarDuplicados
                      }
                      disabled={
                        buscandoDuplicados
                      }
                    >
                      {buscandoDuplicados
                        ? "Analizando..."
                        : "Buscar duplicados"}
                    </button>

                  </div>

                ) : buscandoDuplicados ? (

                  /* ANALIZANDO */

                  <div className="u02-analysis">

                    <div className="u02-analysis-code">
                      U02
                    </div>

                    <div className="u02-analysis-icon">
                      ...
                    </div>

                    <h3>
                      Analizando urgencias
                    </h3>

                    <p>
                      El sistema está
                      comparando las urgencias
                      registradas por paciente
                      e historia clínica.
                    </p>

                  </div>

                ) : duplicadosVisibles.length ===
                  0 ? (

                  /* SIN DUPLICADOS */

                  <div className="u02-analysis success">

                    <div className="u02-analysis-code">
                      U02
                    </div>

                    <div className="u02-analysis-icon">
                      ✓
                    </div>

                    <h3>
                      {duplicados.length ===
                        0
                        ? "No se encontraron urgencias duplicadas"
                        : "No hay casos pendientes de revisión"}
                    </h3>

                    <p>
                      {duplicados.length ===
                        0
                        ? "El análisis revisó las urgencias registradas y no encontró dos o más registros asociados al mismo paciente e historia clínica."
                        : "Todos los casos detectados fueron marcados como no duplicados."}
                    </p>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={
                        buscarDuplicados
                      }
                      disabled={
                        buscandoDuplicados
                      }
                    >
                      Actualizar análisis
                    </button>

                  </div>

                ) : (

                  /* DUPLICADOS */

                  <div className="u02-duplicates">

                    <div className="u02-duplicates-title">

                      <h3>
                        Urgencias pendientes de revisión
                      </h3>

                      <span>
                        {
                          duplicadosVisibles.length
                        }{" "}
                        caso(s)
                      </span>

                    </div>

                    <div className="duplicados-lista">

                      {duplicadosVisibles.map(
                        (duplicado) => (
                          <article
                            key={
                              duplicado.clave
                            }
                            className="duplicate-card"
                          >

                            <div className="duplicate-card-header">

                              <div>

                                <h3>
                                  {
                                    duplicado.nombrePaciente
                                  }
                                </h3>

                              </div>

                              <span className="duplicate-alert">
                                POSIBLE DUPLICADO
                              </span>

                            </div>

                            <div className="duplicate-comparison">

                              {/* ORIGINAL */}

                              <div className="duplicate-column">

                                <h4>
                                  Urgencia original
                                </h4>

                                <p>
                                  Código:{" "}
                                  <strong>
                                    URG-
                                    {String(
                                      duplicado
                                        .original
                                        .idUrgencia
                                    ).padStart(
                                      4,
                                      "0"
                                    )}
                                  </strong>
                                </p>

                                <p>
                                  Historia:{" "}
                                  <strong>
                                    {
                                      duplicado
                                        .original
                                        .historiaClinica
                                        .codigoHistoria
                                    }
                                  </strong>
                                </p>

                                <p>
                                  Tipo:{" "}
                                  <strong>
                                    {
                                      duplicado
                                        .original
                                        .tipoUrgencia
                                    }
                                  </strong>
                                </p>

                                <p>
                                  Estado:{" "}
                                  <strong>
                                    {etiquetaEstadoUrgencia(
                                      duplicado
                                        .original
                                        .estado
                                    )}
                                  </strong>
                                </p>

                              </div>

                              {/* DUPLICADO */}

                              <div className="duplicate-column">

                                <h4>
                                  Posible duplicado
                                </h4>

                                <p>
                                  Código:{" "}
                                  <strong>
                                    URG-
                                    {String(
                                      duplicado
                                        .duplicado
                                        .idUrgencia
                                    ).padStart(
                                      4,
                                      "0"
                                    )}
                                  </strong>
                                </p>

                                <p>
                                  Historia:{" "}
                                  <strong>
                                    {
                                      duplicado
                                        .duplicado
                                        .historiaClinica
                                        .codigoHistoria
                                    }
                                  </strong>
                                </p>

                                <p>
                                  Tipo:{" "}
                                  <strong>
                                    {
                                      duplicado
                                        .duplicado
                                        .tipoUrgencia
                                    }
                                  </strong>
                                </p>

                                <p>
                                  Estado:{" "}
                                  <strong>
                                    {etiquetaEstadoUrgencia(
                                      duplicado
                                        .duplicado
                                        .estado
                                    )}
                                  </strong>
                                </p>

                              </div>

                            </div>

                            <div className="duplicate-actions">

                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                  abrirDetalleDuplicado(
                                    duplicado
                                  )
                                }
                              >
                                Ver detalle
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                  marcarNoDuplicado(
                                    duplicado
                                  )
                                }
                              >
                                No es duplicado
                              </button>

                              <button
                                type="button"
                                className="btn btn-warning"
                                onClick={() =>
                                  solicitarFusion(
                                    duplicado
                                  )
                                }
                              >
                                Confirmar duplicado
                              </button>

                            </div>

                          </article>
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>
            </section>
          )}

      </div>

      {/* ======================================================
          MODAL - NUEVA / EDITAR URGENCIA
      ====================================================== */}

      {(modal ===
        "urgencia-nueva" ||
        modal ===
        "urgencia-editar") && (
          <div className="casos-modal-overlay">

            <div className="casos-modal">

              <div className="casos-modal-header">

                <div>

                  <span className="casos-section-kicker">
                    U01
                  </span>

                  <h2>
                    {modal ===
                      "urgencia-nueva"
                      ? "Nueva urgencia dental"
                      : "Editar urgencia dental"}
                  </h2>

                  <p>
                    Complete la información
                    del caso para registrar
                    la atención.
                  </p>

                </div>

                <button
                  type="button"
                  className="casos-modal-close"
                  onClick={
                    cerrarModal
                  }
                >
                  ×
                </button>

              </div>

              <form
                className="casos-formulario"
                onSubmit={
                  guardarUrgencia
                }
              >

                <div className="form-grid">

                  <div className="form-group">

                    <label htmlFor="urgencia-paciente">
                      Paciente *
                    </label>

                    <select
                      id="urgencia-paciente"
                      value={
                        formularioUrgencia.idPaciente
                      }
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        if (!value) {
                          setFormularioUrgencia(
                            (actual) => ({
                              ...actual,
                              idPaciente:
                                "",
                              idHistoria:
                                "",
                            })
                          );

                          setHistorias(
                            []
                          );

                          setHistoriaSeleccionada(
                            null
                          );

                          return;
                        }

                        void cambiarPacienteUrgencia(
                          Number(value)
                        );
                      }}
                      required
                    >

                      <option value="">
                        Seleccione un paciente
                      </option>

                      {pacientes.map(
                        (paciente) => (
                          <option
                            key={
                              paciente.idPaciente
                            }
                            value={
                              paciente.idPaciente
                            }
                          >
                            {
                              paciente.nombres
                            }{" "}
                            {
                              paciente.apellidos
                            }{" "}
                            —{" "}
                            {
                              paciente.documento
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="form-group">

                    <label htmlFor="urgencia-historia">
                      Historia clínica *
                    </label>

                    <select
                      id="urgencia-historia"
                      value={
                        formularioUrgencia.idHistoria
                      }
                      onChange={(event) =>
                        setFormularioUrgencia(
                          (actual) => ({
                            ...actual,
                            idHistoria:
                              event.target
                                .value
                                ? Number(
                                  event
                                    .target
                                    .value
                                )
                                : "",
                          })
                        )
                      }
                      required
                      disabled={
                        formularioUrgencia.idPaciente ===
                        "" ||
                        cargandoHistoria
                      }
                    >

                      <option value="">
                        {cargandoHistoria
                          ? "Cargando historia..."
                          : historias.length ===
                            0
                            ? "Seleccione un paciente"
                            : "Seleccione una historia"}
                      </option>

                      {historias.map(
                        (historia) => (
                          <option
                            key={
                              historia.idHistoria
                            }
                            value={
                              historia.idHistoria
                            }
                          >
                            {
                              historia.codigoHistoria
                            }
                          </option>
                        )
                      )}

                    </select>

                    {historiaSeleccionada && (
                      <small className="form-help">
                        Historia seleccionada:{" "}
                        {
                          historiaSeleccionada.codigoHistoria
                        }
                      </small>
                    )}

                  </div>

                  <div className="form-group">

                    <label htmlFor="urgencia-tipo">
                      Tipo de urgencia *
                    </label>

                    <input
                      id="urgencia-tipo"
                      type="text"
                      maxLength={100}
                      value={
                        formularioUrgencia.tipoUrgencia
                      }
                      onChange={(event) =>
                        setFormularioUrgencia(
                          (actual) => ({
                            ...actual,
                            tipoUrgencia:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Ej. Dolor Agudo"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="urgencia-estado">
                      Estado
                    </label>

                    <select
                      id="urgencia-estado"
                      value={
                        formularioUrgencia.estado
                      }
                      onChange={(event) =>
                        setFormularioUrgencia(
                          (actual) => ({
                            ...actual,
                            estado:
                              event.target
                                .value as EstadoUrgencia,
                          })
                        )
                      }
                    >

                      <option value="ACTIVA">
                        ACTIVA
                      </option>

                      <option value="EN_ATENCION">
                        EN ATENCIÓN
                      </option>

                      <option value="RESUELTA">
                        RESUELTA
                      </option>

                    </select>

                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="urgencia-descripcion">
                    Descripción *
                  </label>

                  <textarea
                    id="urgencia-descripcion"
                    rows={5}
                    value={
                      formularioUrgencia.descripcion
                    }
                    onChange={(event) =>
                      setFormularioUrgencia(
                        (actual) => ({
                          ...actual,
                          descripcion:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Describa la situación clínica del paciente..."
                    required
                  />

                </div>

                <div className="casos-form-actions">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      cerrarModal
                    }
                    disabled={
                      guardando
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      guardando
                    }
                  >
                    {guardando
                      ? "Guardando..."
                      : modal ===
                        "urgencia-nueva"
                        ? "Registrar urgencia"
                        : "Guardar cambios"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* ======================================================
          MODAL - VER URGENCIA
      ====================================================== */}

      {modal ===
        "urgencia-ver" &&
        urgenciaSeleccionada && (
          <div className="casos-modal-overlay">

            <div className="casos-modal">

              <div className="casos-modal-header">

                <div>

                  <span className="casos-section-kicker">
                    U01
                  </span>

                  <h2>
                    Detalle de urgencia
                  </h2>

                  <p>
                    Información completa
                    del caso registrado.
                  </p>

                </div>

                <button
                  type="button"
                  className="casos-modal-close"
                  onClick={
                    cerrarModal
                  }
                >
                  ×
                </button>

              </div>

              <div className="detalle-grid">

                <div className="detalle-item">

                  <span>
                    Código
                  </span>

                  <strong>
                    URG-
                    {String(
                      urgenciaSeleccionada.idUrgencia
                    ).padStart(
                      4,
                      "0"
                    )}
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Estado
                  </span>

                  <strong>
                    {etiquetaEstadoUrgencia(
                      urgenciaSeleccionada.estado
                    )}
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Paciente
                  </span>

                  <strong>
                    {
                      urgenciaSeleccionada
                        .paciente
                        .nombres
                    }{" "}
                    {
                      urgenciaSeleccionada
                        .paciente
                        .apellidos
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Documento
                  </span>

                  <strong>
                    {
                      urgenciaSeleccionada
                        .paciente
                        .documento
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Historia clínica
                  </span>

                  <strong>
                    {
                      urgenciaSeleccionada
                        .historiaClinica
                        .codigoHistoria
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Tipo de urgencia
                  </span>

                  <strong>
                    {
                      urgenciaSeleccionada
                        .tipoUrgencia
                    }
                  </strong>

                </div>

              </div>

              <div className="detalle-descripcion">

                <span>
                  Descripción
                </span>

                <p>
                  {
                    urgenciaSeleccionada
                      .descripcion
                  }
                </p>

              </div>

              <div className="detalle-fecha">
                Registrado:{" "}
                {formatearFecha(
                  urgenciaSeleccionada
                    .fechaRegistro
                )}
              </div>

              <div className="casos-form-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    cerrarModal
                  }
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    abrirEditarUrgencia(
                      urgenciaSeleccionada
                    )
                  }
                >
                  Editar
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ======================================================
          MODAL - NUEVO / EDITAR EXTRANJERO
      ====================================================== */}

      {(modal ===
        "extranjero-nuevo" ||
        modal ===
        "extranjero-editar") && (
          <div className="casos-modal-overlay">

            <div className="casos-modal">

              <div className="casos-modal-header">

                <div>

                  <span className="casos-section-kicker">
                    CASO ESPECIAL
                  </span>

                  <h2>
                    {modal ===
                      "extranjero-nuevo"
                      ? "Registro Rápido — Paciente Extranjero"
                      : "Editar Paciente Extranjero"}
                  </h2>

                  <p>
                    {modal ===
                      "extranjero-nuevo"
                      ? "Registre los datos básicos para gestionar la atención y cobertura internacional."
                      : "Actualice los datos de identificación y cobertura internacional."}
                  </p>

                </div>

                <button
                  type="button"
                  className="casos-modal-close"
                  onClick={
                    cerrarModal
                  }
                >
                  ×
                </button>

              </div>

              <form
                className="casos-formulario"
                onSubmit={
                  guardarExtranjero
                }
              >

                <div className="form-grid">

                  <div className="form-group form-group-full">

                    <label htmlFor="extranjero-paciente">
                      Paciente *
                    </label>

                    <select
                      id="extranjero-paciente"
                      value={
                        formularioExtranjero.idPaciente
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            idPaciente:
                              event.target
                                .value
                                ? Number(
                                  event
                                    .target
                                    .value
                                )
                                : "",
                          })
                        )
                      }
                      required
                      disabled={
                        modal ===
                        "extranjero-editar"
                      }
                    >

                      <option value="">
                        Seleccione un paciente
                      </option>

                      {modal ===
                        "extranjero-editar" &&
                        extranjeroSeleccionado && (
                          <option
                            value={
                              extranjeroSeleccionado
                                .paciente
                                .idPaciente
                            }
                          >
                            {
                              extranjeroSeleccionado
                                .paciente
                                .nombres
                            }{" "}
                            {
                              extranjeroSeleccionado
                                .paciente
                                .apellidos
                            }{" "}
                            —{" "}
                            {
                              extranjeroSeleccionado
                                .paciente
                                .documento
                            }
                          </option>
                        )}

                      {modal ===
                        "extranjero-nuevo" &&
                        pacientesDisponiblesParaExtranjero.map(
                          (paciente) => (
                            <option
                              key={
                                paciente.idPaciente
                              }
                              value={
                                paciente.idPaciente
                              }
                            >
                              {
                                paciente.nombres
                              }{" "}
                              {
                                paciente.apellidos
                              }{" "}
                              —{" "}
                              {
                                paciente.documento
                              }
                            </option>
                          )
                        )}

                    </select>

                    {modal ===
                      "extranjero-nuevo" &&
                      pacientesDisponiblesParaExtranjero.length ===
                      0 && (
                        <small className="form-help">
                          Todos los pacientes
                          disponibles ya
                          están registrados
                          como extranjeros.
                        </small>
                      )}

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-nacionalidad">
                      Nacionalidad *
                    </label>

                    <input
                      id="extranjero-nacionalidad"
                      type="text"
                      maxLength={80}
                      value={
                        formularioExtranjero.nacionalidad
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            nacionalidad:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Ej. Brasileña"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-tipo-documento">
                      Tipo de documento *
                    </label>

                    <select
                      id="extranjero-tipo-documento"
                      value={
                        formularioExtranjero.tipoDocumento
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            tipoDocumento:
                              event.target
                                .value as TipoDocumentoExtranjero,
                          })
                        )
                      }
                    >

                      <option value="PASAPORTE">
                        Pasaporte
                      </option>

                      <option value="CE">
                        Carné de Extranjería
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-numero-documento">
                      Número de documento *
                    </label>

                    <input
                      id="extranjero-numero-documento"
                      type="text"
                      maxLength={50}
                      value={
                        formularioExtranjero.numeroDocumento
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            numeroDocumento:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Ingrese el número"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-cobertura">
                      Cobertura *
                    </label>

                    <input
                      id="extranjero-cobertura"
                      type="text"
                      maxLength={50}
                      value={
                        formularioExtranjero.cobertura
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            cobertura:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Ej. PARTICULAR"
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-especialidad">
                      Especialidad
                    </label>

                    <input
                      id="extranjero-especialidad"
                      type="text"
                      maxLength={100}
                      value={
                        formularioExtranjero.especialidad
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            especialidad:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Ej. Cirugía Oral"
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-estado-cobertura">
                      Estado de cobertura
                    </label>

                    <select
                      id="extranjero-estado-cobertura"
                      value={
                        formularioExtranjero.estadoCobertura
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            estadoCobertura:
                              event.target
                                .value as EstadoCobertura,
                          })
                        )
                      }
                    >

                      <option value="PENDIENTE">
                        PENDIENTE
                      </option>

                      <option value="VALIDADA">
                        VALIDADA
                      </option>

                      <option value="RECHAZADA">
                        RECHAZADA
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label htmlFor="extranjero-carta">
                      Carta de garantía
                    </label>

                    <select
                      id="extranjero-carta"
                      value={
                        formularioExtranjero.cartaGarantia
                      }
                      onChange={(event) =>
                        setFormularioExtranjero(
                          (actual) => ({
                            ...actual,
                            cartaGarantia:
                              event.target
                                .value as EstadoCartaGarantia,
                          })
                        )
                      }
                    >

                      <option value="NO_SOLICITADA">
                        NO SOLICITADA
                      </option>

                      <option value="SOLICITADA">
                        SOLICITADA
                      </option>

                      <option value="RECIBIDA">
                        RECIBIDA
                      </option>

                    </select>

                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="extranjero-observaciones">
                    Observaciones
                  </label>

                  <textarea
                    id="extranjero-observaciones"
                    rows={4}
                    value={
                      formularioExtranjero.observaciones
                    }
                    onChange={(event) =>
                      setFormularioExtranjero(
                        (actual) => ({
                          ...actual,
                          observaciones:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Observaciones adicionales..."
                  />

                </div>

                <div className="casos-form-actions">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      cerrarModal
                    }
                    disabled={
                      guardando
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      guardando ||
                      (modal ===
                        "extranjero-nuevo" &&
                        pacientesDisponiblesParaExtranjero.length ===
                        0)
                    }
                  >
                    {guardando
                      ? "Guardando..."
                      : modal ===
                        "extranjero-nuevo"
                        ? "Registrar Paciente"
                        : "Guardar cambios"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* ======================================================
          MODAL - DETALLE DE URGENCIA DUPLICADA
      ====================================================== */}

      {modal ===
        "duplicado-ver" &&
        duplicadoSeleccionado && (
          <div className="casos-modal-overlay">

            <div className="casos-modal">

              <div className="casos-modal-header">

                <div>

                  <span className="casos-section-kicker">
                    U02
                  </span>

                  <h2>
                    Detalle de urgencia duplicada
                  </h2>

                  <p>
                    Revisión comparativa
                    antes de realizar
                    cualquier acción.
                  </p>

                </div>

                <button
                  type="button"
                  className="casos-modal-close"
                  onClick={
                    cerrarModal
                  }
                >
                  ×
                </button>

              </div>

              <div className="detalle-grid">

                <div className="detalle-item">

                  <span>
                    Paciente
                  </span>

                  <strong>
                    {
                      duplicadoSeleccionado
                        .nombrePaciente
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Historia clínica
                  </span>

                  <strong>
                    {
                      duplicadoSeleccionado
                        .original
                        .historiaClinica
                        .codigoHistoria
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Urgencia original
                  </span>

                  <strong>
                    URG-
                    {String(
                      duplicadoSeleccionado
                        .original
                        .idUrgencia
                    ).padStart(
                      4,
                      "0"
                    )}
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Tipo original
                  </span>

                  <strong>
                    {
                      duplicadoSeleccionado
                        .original
                        .tipoUrgencia
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Posible duplicado
                  </span>

                  <strong>
                    URG-
                    {String(
                      duplicadoSeleccionado
                        .duplicado
                        .idUrgencia
                    ).padStart(
                      4,
                      "0"
                    )}
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Tipo duplicado
                  </span>

                  <strong>
                    {
                      duplicadoSeleccionado
                        .duplicado
                        .tipoUrgencia
                    }
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Estado original
                  </span>

                  <strong>
                    {etiquetaEstadoUrgencia(
                      duplicadoSeleccionado
                        .original
                        .estado
                    )}
                  </strong>

                </div>

                <div className="detalle-item">

                  <span>
                    Estado duplicado
                  </span>

                  <strong>
                    {etiquetaEstadoUrgencia(
                      duplicadoSeleccionado
                        .duplicado
                        .estado
                    )}
                  </strong>

                </div>

              </div>

              <div className="detalle-descripcion">

                <span>
                  Observación
                </span>

                <p>
                  Las dos urgencias están
                  asociadas al mismo paciente
                  y a la misma historia clínica.
                  Por este motivo, el segundo
                  registro fue incluido en la
                  revisión U02 como posible
                  duplicado. La fusión no se
                  ejecuta automáticamente para
                  proteger la integridad de los
                  registros.
                </p>

              </div>

              <div className="casos-form-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    cerrarModal
                  }
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    solicitarFusion(
                      duplicadoSeleccionado
                    );
                    cerrarModal();
                  }}
                >
                  Confirmar duplicado
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}