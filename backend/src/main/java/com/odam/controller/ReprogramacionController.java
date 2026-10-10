package com.odam.controller;

import com.odam.dto.ReprogramacionRequest;
import com.odam.entity.Cita;
import com.odam.entity.Reprogramacion;
import com.odam.repository.CitaRepository;
import com.odam.repository.ReprogramacionRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reprogramaciones")
@CrossOrigin(origins = "http://localhost:5173")
public class ReprogramacionController {

    private final ReprogramacionRepository reprogramacionRepository;
    private final CitaRepository citaRepository;

    public ReprogramacionController(
            ReprogramacionRepository reprogramacionRepository,
            CitaRepository citaRepository
    ) {
        this.reprogramacionRepository = reprogramacionRepository;
        this.citaRepository = citaRepository;
    }

    // ============================================================
    // LISTAR
    // ============================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> listar() {

        List<Map<String, Object>> resultado =
                reprogramacionRepository.findAll()
                        .stream()
                        .map(this::convertirRespuesta)
                        .toList();

        return ResponseEntity.ok(resultado);
    }

    // ============================================================
    // OBTENER POR ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> obtener(
            @PathVariable Integer id
    ) {

        return reprogramacionRepository.findById(id)
                .map(reprogramacion ->
                        ResponseEntity.ok(
                                convertirRespuesta(reprogramacion)
                        )
                )
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of(
                                        "message",
                                        "La reprogramación no existe"
                                ))
                );
    }

    // ============================================================
    // CREAR REPROGRAMACIÓN
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public ResponseEntity<?> crear(
            @Valid @RequestBody ReprogramacionRequest request
    ) {

        Cita cita = citaRepository.findById(request.idCita())
                .orElse(null);

        if (cita == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "La cita indicada no existe"
                    ));
        }

        boolean horarioOcupado =
                citaRepository
                        .existsByIdOdontologoIdOdontologoAndFechaCitaAndHoraCitaAndIdCitaNot(
                                cita.getOdontologo().getIdOdontologo(),
                                request.nuevaFecha(),
                                request.nuevaHora(),
                                cita.getIdCita()
                        );

        if (horarioOcupado) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "El odontólogo ya tiene una cita registrada en la nueva fecha y hora"
                    ));
        }

        Reprogramacion reprogramacion =
                new Reprogramacion();

        reprogramacion.setCita(cita);
        reprogramacion.setFechaAnterior(cita.getFechaCita());
        reprogramacion.setHoraAnterior(cita.getHoraCita());
        reprogramacion.setNuevaFecha(request.nuevaFecha());
        reprogramacion.setNuevaHora(request.nuevaHora());
        reprogramacion.setMotivo(request.motivo());

        Reprogramacion guardada =
                reprogramacionRepository.saveAndFlush(
                        reprogramacion
                );

        cita.setFechaCita(request.nuevaFecha());
        cita.setHoraCita(request.nuevaHora());
        cita.setEstado(Cita.EstadoCita.REPROGRAMADA);

        citaRepository.save(cita);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertirRespuesta(guardada));
    }

    // ============================================================
    // EDITAR REPROGRAMACIÓN
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ReprogramacionRequest request
    ) {

        Reprogramacion reprogramacion =
                reprogramacionRepository.findById(id)
                        .orElse(null);

        if (reprogramacion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "La reprogramación no existe"
                    ));
        }

        Cita cita = reprogramacion.getCita();

        if (cita == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "La cita asociada a la reprogramación no existe"
                    ));
        }

        // La cita enviada debe corresponder a la reprogramación
        if (!cita.getIdCita().equals(request.idCita())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "message",
                            "La cita indicada no corresponde a la reprogramación"
                    ));
        }

        // Verificar que el nuevo horario no esté ocupado
        boolean horarioOcupado =
                citaRepository
                        .existsByIdOdontologoIdOdontologoAndFechaCitaAndHoraCitaAndIdCitaNot(
                                cita.getOdontologo().getIdOdontologo(),
                                request.nuevaFecha(),
                                request.nuevaHora(),
                                cita.getIdCita()
                        );

        if (horarioOcupado) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "El odontólogo ya tiene una cita registrada en la nueva fecha y hora"
                    ));
        }

        // Actualizar únicamente los datos editables
        reprogramacion.setNuevaFecha(request.nuevaFecha());
        reprogramacion.setNuevaHora(request.nuevaHora());
        reprogramacion.setMotivo(request.motivo());

        Reprogramacion actualizada =
                reprogramacionRepository.saveAndFlush(
                        reprogramacion
                );

        // Actualizar también la cita
        cita.setFechaCita(request.nuevaFecha());
        cita.setHoraCita(request.nuevaHora());
        cita.setEstado(Cita.EstadoCita.REPROGRAMADA);

        citaRepository.save(cita);

        return ResponseEntity.ok(
                convertirRespuesta(actualizada)
        );
    }

    // ============================================================
    // ELIMINAR
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id
    ) {

        Reprogramacion reprogramacion =
                reprogramacionRepository.findById(id)
                        .orElse(null);

        if (reprogramacion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "La reprogramación no existe"
                    ));
        }

        reprogramacionRepository.delete(reprogramacion);

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // CONVERTIR RESPUESTA
    // ============================================================

    private Map<String, Object> convertirRespuesta(
            Reprogramacion reprogramacion
    ) {

        Cita cita = reprogramacion.getCita();

        Map<String, Object> respuesta =
                new LinkedHashMap<>();

        respuesta.put(
                "idReprogramacion",
                reprogramacion.getIdReprogramacion()
        );

        respuesta.put(
                "idCita",
                cita != null
                        ? cita.getIdCita()
                        : null
        );

        respuesta.put(
                "idPaciente",
                cita != null && cita.getPaciente() != null
                        ? cita.getPaciente().getIdPaciente()
                        : null
        );

        respuesta.put(
                "idOdontologo",
                cita != null && cita.getOdontologo() != null
                        ? cita.getOdontologo().getIdOdontologo()
                        : null
        );

        respuesta.put(
                "fechaAnterior",
                reprogramacion.getFechaAnterior()
        );

        respuesta.put(
                "horaAnterior",
                reprogramacion.getHoraAnterior()
        );

        respuesta.put(
                "nuevaFecha",
                reprogramacion.getNuevaFecha()
        );

        respuesta.put(
                "nuevaHora",
                reprogramacion.getNuevaHora()
        );

        respuesta.put(
                "motivo",
                reprogramacion.getMotivo() == null
                        ? ""
                        : reprogramacion.getMotivo()
        );

        respuesta.put(
                "fechaReprogramacion",
                reprogramacion.getFechaReprogramacion()
        );

        return respuesta;
    }
}