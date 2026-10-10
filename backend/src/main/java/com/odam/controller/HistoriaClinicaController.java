package com.odam.controller;

import com.odam.dto.HistoriaClinicaRequest;
import com.odam.entity.HistoriaClinica;
import com.odam.entity.Paciente;
import com.odam.repository.HistoriaClinicaRepository;
import com.odam.repository.PacienteRepository;

import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historias")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class HistoriaClinicaController {

    private final HistoriaClinicaRepository historiaRepository;
    private final PacienteRepository pacienteRepository;

    public HistoriaClinicaController(
            HistoriaClinicaRepository historiaRepository,
            PacienteRepository pacienteRepository) {

        this.historiaRepository = historiaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    // ============================================================
    // LISTAR TODAS LAS HISTORIAS
    // ============================================================

    @GetMapping
    public List<HistoriaClinica> listar() {
        return historiaRepository.findAll();
    }

    // ============================================================
    // OBTENER HISTORIA POR ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<HistoriaClinica> obtener(
            @PathVariable Integer id) {

        return historiaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // OBTENER HISTORIA POR PACIENTE
    // ============================================================

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<HistoriaClinica> obtenerPorPaciente(
            @PathVariable Integer idPaciente) {

        return historiaRepository
                .findByPacienteIdPaciente(idPaciente)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // CREAR HISTORIA CLÍNICA
    // ============================================================

    @PostMapping
    public ResponseEntity<?> crear(
            @Valid @RequestBody HistoriaClinicaRequest request) {

        // --------------------------------------------------------
        // VERIFICAR PACIENTE
        // --------------------------------------------------------

        Paciente paciente = pacienteRepository
                .findById(request.idPaciente())
                .orElse(null);

        if (paciente == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("El paciente indicado no existe.");
        }

        // --------------------------------------------------------
        // VERIFICAR QUE EL PACIENTE NO TENGA HISTORIA
        // --------------------------------------------------------

        if (historiaRepository
                .existsByPacienteIdPaciente(request.idPaciente())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("El paciente ya tiene una historia clínica.");
        }

        // --------------------------------------------------------
        // VERIFICAR CÓDIGO
        // --------------------------------------------------------

        if (historiaRepository
                .existsByCodigoHistoria(request.codigoHistoria())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("El código de historia clínica ya existe.");
        }

        // --------------------------------------------------------
        // CREAR HISTORIA
        // --------------------------------------------------------

        HistoriaClinica historia = new HistoriaClinica();

        historia.setPaciente(paciente);
        historia.setCodigoHistoria(request.codigoHistoria());
        historia.setAntecedentes(request.antecedentes());
        historia.setAlergias(request.alergias());
        historia.setObservaciones(request.observaciones());

        HistoriaClinica guardada =
                historiaRepository.save(historia);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardada);
    }

    // ============================================================
    // ACTUALIZAR HISTORIA CLÍNICA
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody HistoriaClinicaRequest request) {

        return historiaRepository.findById(id)
                .map(historia -> {

                    // ------------------------------------------------
                    // VERIFICAR PACIENTE
                    // ------------------------------------------------

                    Paciente paciente = pacienteRepository
                            .findById(request.idPaciente())
                            .orElse(null);

                    if (paciente == null) {
                        return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body("El paciente indicado no existe.");
                    }

                    // ------------------------------------------------
                    // VERIFICAR CÓDIGO DUPLICADO
                    // ------------------------------------------------

                    if (!historia.getCodigoHistoria()
                            .equals(request.codigoHistoria())
                            && historiaRepository
                            .existsByCodigoHistoria(
                                    request.codigoHistoria())) {

                        return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(
                                    "El código de historia clínica ya existe."
                                );
                    }

                    // ------------------------------------------------
                    // ACTUALIZAR
                    // ------------------------------------------------

                    historia.setPaciente(paciente);
                    historia.setCodigoHistoria(
                            request.codigoHistoria()
                    );
                    historia.setAntecedentes(
                            request.antecedentes()
                    );
                    historia.setAlergias(
                            request.alergias()
                    );
                    historia.setObservaciones(
                            request.observaciones()
                    );

                    return ResponseEntity.ok(
                            historiaRepository.save(historia)
                    );
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // ELIMINAR HISTORIA CLÍNICA
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id) {

        HistoriaClinica historia = historiaRepository
                .findById(id)
                .orElse(null);

        if (historia == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("La historia clínica no existe.");
        }

        try {
            historiaRepository.delete(historia);
            historiaRepository.flush();

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                        "No se puede eliminar la historia clínica porque tiene registros relacionados."
                    );
        }
    }
}