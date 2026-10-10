
package com.odam.controller;

import com.odam.dto.RevisionDuplicidadRequest;
import com.odam.dto.UrgenciaDentalRequest;
import com.odam.dto.UrgenciaDentalResponse;
import com.odam.entity.HistoriaClinica;
import com.odam.entity.Paciente;
import com.odam.entity.UrgenciaDental;
import com.odam.entity.UrgenciaDuplicidad;
import com.odam.repository.HistoriaClinicaRepository;
import com.odam.repository.PacienteRepository;
import com.odam.repository.UrgenciaDentalRepository;
import com.odam.repository.UrgenciaDuplicidadRepository;
import com.odam.service.UrgenciaDuplicidadService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/urgencias")
@CrossOrigin(origins = "http://localhost:5173")
public class UrgenciaDentalController {

    private final UrgenciaDentalRepository urgenciaRepository;
    private final PacienteRepository pacienteRepository;
    private final HistoriaClinicaRepository historiaRepository;
    private final UrgenciaDuplicidadService duplicidadService;
    private final UrgenciaDuplicidadRepository duplicidadRepository;

    public UrgenciaDentalController(
            UrgenciaDentalRepository urgenciaRepository,
            PacienteRepository pacienteRepository,
            HistoriaClinicaRepository historiaRepository,
            UrgenciaDuplicidadService duplicidadService,
            UrgenciaDuplicidadRepository duplicidadRepository
    ) {
        this.urgenciaRepository = urgenciaRepository;
        this.pacienteRepository = pacienteRepository;
        this.historiaRepository = historiaRepository;
        this.duplicidadService = duplicidadService;
        this.duplicidadRepository = duplicidadRepository;
    }

    // =========================================================
    // LISTAR URGENCIAS NO ELIMINADAS
    // GET /api/urgencias
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<UrgenciaDentalResponse>> listar() {

        List<UrgenciaDentalResponse> respuesta =
                urgenciaRepository.findByEliminadaFalse()
                        .stream()
                        .map(this::convertir)
                        .toList();

        return ResponseEntity.ok(respuesta);
    }

    // =========================================================
    // LISTAR URGENCIAS ACTIVAS NO ELIMINADAS
    // GET /api/urgencias/activas
    // =========================================================

    @GetMapping("/activas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<UrgenciaDentalResponse>> listarActivas() {

        List<UrgenciaDentalResponse> respuesta =
                urgenciaRepository
                        .findByEstadoAndEliminadaFalse("ACTIVA")
                        .stream()
                        .map(this::convertir)
                        .toList();

        return ResponseEntity.ok(respuesta);
    }

    // =========================================================
    // OBTENER UNA URGENCIA POR ID
    // GET /api/urgencias/{id}
    // Las urgencias eliminadas no se muestran normalmente.
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UrgenciaDentalResponse> obtener(
            @PathVariable Integer id
    ) {

        return urgenciaRepository.findById(id)
                .filter(urgencia -> !urgencia.isEliminada())
                .map(this::convertir)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // REGISTRAR UNA NUEVA URGENCIA
    // POST /api/urgencias
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crear(
            @Valid @RequestBody UrgenciaDentalRequest request
    ) {

        Paciente paciente =
                pacienteRepository.findById(request.getIdPaciente())
                        .orElse(null);

        if (paciente == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "El paciente indicado no existe."
                    ));
        }

        HistoriaClinica historia =
                historiaRepository.findById(request.getIdHistoria())
                        .orElse(null);

        if (historia == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "La historia clínica indicada no existe."
                    ));
        }

        if (historia.getPaciente() == null
                || !historia.getPaciente()
                        .getIdPaciente()
                        .equals(paciente.getIdPaciente())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "La historia clínica no pertenece "
                                    + "al paciente seleccionado."
                    ));
        }

        UrgenciaDental urgencia = new UrgenciaDental();

        urgencia.setPaciente(paciente);
        urgencia.setHistoriaClinica(historia);
        urgencia.setTipoUrgencia(
                request.getTipoUrgencia().trim()
        );
        urgencia.setDescripcion(
                request.getDescripcion().trim()
        );

        String estado = request.getEstado();

        if (estado == null || estado.isBlank()) {
            estado = "ACTIVA";
        }

        estado = estado.trim().toUpperCase();

        if (!estadoValido(estado)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "Estado no válido. Use ACTIVA, "
                                    + "EN_ATENCION o RESUELTA."
                    ));
        }

        urgencia.setEstado(estado);

        // Una urgencia nueva siempre comienza como no eliminada.
        urgencia.setEliminada(false);

        UrgenciaDental guardada =
                urgenciaRepository.save(urgencia);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertir(guardada));
    }

    // =========================================================
    // ACTUALIZAR UNA URGENCIA
    // PUT /api/urgencias/{id}
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UrgenciaDentalRequest request
    ) {

        UrgenciaDental urgencia =
                urgenciaRepository.findById(id)
                        .orElse(null);

        if (urgencia == null || urgencia.isEliminada()) {
            return ResponseEntity.notFound().build();
        }

        Paciente paciente =
                pacienteRepository.findById(request.getIdPaciente())
                        .orElse(null);

        if (paciente == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "El paciente indicado no existe."
                    ));
        }

        HistoriaClinica historia =
                historiaRepository.findById(request.getIdHistoria())
                        .orElse(null);

        if (historia == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "La historia clínica indicada no existe."
                    ));
        }

        if (historia.getPaciente() == null
                || !historia.getPaciente()
                        .getIdPaciente()
                        .equals(paciente.getIdPaciente())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "La historia clínica no pertenece "
                                    + "al paciente seleccionado."
                    ));
        }

        urgencia.setPaciente(paciente);
        urgencia.setHistoriaClinica(historia);
        urgencia.setTipoUrgencia(
                request.getTipoUrgencia().trim()
        );
        urgencia.setDescripcion(
                request.getDescripcion().trim()
        );

        if (request.getEstado() != null
                && !request.getEstado().isBlank()) {

            String estado = request.getEstado()
                    .trim()
                    .toUpperCase();

            if (!estadoValido(estado)) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "mensaje",
                                "Estado no válido. Use ACTIVA, "
                                        + "EN_ATENCION o RESUELTA."
                        ));
            }

            urgencia.setEstado(estado);
        }

        UrgenciaDental actualizada =
                urgenciaRepository.save(urgencia);

        return ResponseEntity.ok(convertir(actualizada));
    }

    // =========================================================
    // ACTUALIZAR ESTADO DE UNA URGENCIA
    // PUT /api/urgencias/{id}/estado?estado=RESUELTA
    // =========================================================

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Integer id,
            @RequestParam String estado
    ) {

        UrgenciaDental urgencia =
                urgenciaRepository.findById(id)
                        .orElse(null);

        if (urgencia == null || urgencia.isEliminada()) {
            return ResponseEntity.notFound().build();
        }

        String nuevoEstado = estado.trim().toUpperCase();

        if (!estadoValido(nuevoEstado)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje",
                            "Estado no válido. Use ACTIVA, "
                                    + "EN_ATENCION o RESUELTA."
                    ));
        }

        urgencia.setEstado(nuevoEstado);

        UrgenciaDental actualizada =
                urgenciaRepository.save(urgencia);

        return ResponseEntity.ok(convertir(actualizada));
    }

    // =========================================================
    // REGISTRAR REVISIÓN DE DUPLICIDAD
    // POST /api/urgencias/duplicados/revisar
    // =========================================================

    @PostMapping("/duplicados/revisar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> revisarDuplicidad(
            @Valid @RequestBody RevisionDuplicidadRequest request
    ) {

        UrgenciaDuplicidad revision =
                duplicidadService.registrarRevision(
                        request.getIdUrgenciaOriginal(),
                        request.getIdUrgenciaDuplicada()
                );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje",
                        "Revisión de duplicidad registrada. "
                                + "Ambas urgencias se conservaron.",
                        "idRevision",
                        revision.getIdRevision(),
                        "idUrgenciaOriginal",
                        revision.getUrgenciaOriginal()
                                .getIdUrgencia(),
                        "idUrgenciaDuplicada",
                        revision.getUrgenciaDuplicada()
                                .getIdUrgencia(),
                        "estadoRevision",
                        revision.getEstadoRevision()
                ));
    }

    // =========================================================
    // CONSULTAR REVISIONES DE DUPLICIDAD
    // GET /api/urgencias/duplicados
    // Conserva el historial, incluso si una urgencia se da de baja.
    // =========================================================

    @GetMapping("/duplicados")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Map<String, Object>>>
            listarDuplicadosRevisados() {

        List<Map<String, Object>> revisiones =
                duplicidadRepository
                        .findAllByOrderByFechaRevisionDesc()
                        .stream()
                        .map(revision -> Map.<String, Object>of(
                                "idRevision",
                                revision.getIdRevision(),
                                "idUrgenciaOriginal",
                                revision.getUrgenciaOriginal()
                                        .getIdUrgencia(),
                                "idUrgenciaDuplicada",
                                revision.getUrgenciaDuplicada()
                                        .getIdUrgencia(),
                                "estadoRevision",
                                revision.getEstadoRevision(),
                                "fechaRevision",
                                revision.getFechaRevision()
                        ))
                        .toList();

        return ResponseEntity.ok(revisiones);
    }

    // =========================================================
    // ELIMINACIÓN LÓGICA DE UNA URGENCIA
    // DELETE /api/urgencias/{id}
    // No borra físicamente el registro ni sus revisiones.
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id
    ) {

        UrgenciaDental urgencia =
                urgenciaRepository.findById(id)
                        .orElse(null);

        if (urgencia == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "mensaje",
                            "La urgencia dental no existe."
                    ));
        }

        if (urgencia.isEliminada()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "mensaje",
                            "Esta urgencia ya fue eliminada."
                    ));
        }

        // Baja lógica: conservar el registro y la trazabilidad clínica.
        urgencia.setEliminada(true);
        urgenciaRepository.save(urgencia);

        return ResponseEntity.ok(Map.of(
                "mensaje",
                "Urgencia dental eliminada correctamente."
        ));
    }

    // =========================================================
    // VALIDAR ESTADOS PERMITIDOS
    // =========================================================

    private boolean estadoValido(String estado) {
        return estado.equals("ACTIVA")
                || estado.equals("EN_ATENCION")
                || estado.equals("RESUELTA");
    }

    // =========================================================
    // CONVERTIR ENTIDAD A DTO DE RESPUESTA
    // =========================================================

    private UrgenciaDentalResponse convertir(
            UrgenciaDental urgencia
    ) {

        UrgenciaDentalResponse response =
                new UrgenciaDentalResponse();

        response.setIdUrgencia(urgencia.getIdUrgencia());
        response.setTipoUrgencia(urgencia.getTipoUrgencia());
        response.setDescripcion(urgencia.getDescripcion());
        response.setEstado(urgencia.getEstado());
        response.setFechaRegistro(urgencia.getFechaRegistro());

        Paciente paciente = urgencia.getPaciente();

        if (paciente != null) {
            UrgenciaDentalResponse.PacienteResponse
                    pacienteResponse =
                    new UrgenciaDentalResponse.PacienteResponse();

            pacienteResponse.setIdPaciente(
                    paciente.getIdPaciente()
            );
            pacienteResponse.setNombres(
                    paciente.getNombres()
            );
            pacienteResponse.setApellidos(
                    paciente.getApellidos()
            );
            pacienteResponse.setDocumento(
                    paciente.getDocumento()
            );

            response.setPaciente(pacienteResponse);
        }

        HistoriaClinica historia =
                urgencia.getHistoriaClinica();

        if (historia != null) {
            UrgenciaDentalResponse.HistoriaResponse
                    historiaResponse =
                    new UrgenciaDentalResponse.HistoriaResponse();

            historiaResponse.setIdHistoria(
                    historia.getIdHistoria()
            );
            historiaResponse.setCodigoHistoria(
                    historia.getCodigoHistoria()
            );

            response.setHistoriaClinica(historiaResponse);
        }

        return response;
    }
}