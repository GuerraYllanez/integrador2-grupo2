package com.odam.controller;

import com.odam.dto.EvaluacionClinicaRequest;
import com.odam.entity.EvaluacionClinica;
import com.odam.entity.HistoriaClinica;
import com.odam.entity.Odontologo;
import com.odam.repository.EvaluacionClinicaRepository;
import com.odam.repository.HistoriaClinicaRepository;
import com.odam.repository.OdontologoRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class EvaluacionClinicaController {

    private final EvaluacionClinicaRepository evaluacionRepository;
    private final HistoriaClinicaRepository historiaRepository;
    private final OdontologoRepository odontologoRepository;

    public EvaluacionClinicaController(
            EvaluacionClinicaRepository evaluacionRepository,
            HistoriaClinicaRepository historiaRepository,
            OdontologoRepository odontologoRepository) {

        this.evaluacionRepository = evaluacionRepository;
        this.historiaRepository = historiaRepository;
        this.odontologoRepository = odontologoRepository;
    }

    // ============================================================
    // LISTAR TODAS LAS EVALUACIONES
    // ============================================================

    @GetMapping
    public List<EvaluacionResponse> listar() {

        return evaluacionRepository
                .findAllWithRelations()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // OBTENER UNA EVALUACIÓN POR ID
    // ============================================================

    @GetMapping("/{id}")
    public EvaluacionResponse obtener(
            @PathVariable Integer id) {

        EvaluacionClinica evaluacion =
                evaluacionRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evaluación clínica no encontrada"));

        return convertirRespuesta(evaluacion);
    }

    // ============================================================
    // LISTAR EVALUACIONES POR HISTORIA CLÍNICA
    // ============================================================

    @GetMapping("/historia/{idHistoria}")
    public List<EvaluacionResponse> listarPorHistoria(
            @PathVariable Integer idHistoria) {

        return evaluacionRepository
                .findByHistoriaIdHistoriaWithRelations(idHistoria)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // LISTAR EVALUACIONES POR ODONTÓLOGO
    // ============================================================

    @GetMapping("/odontologo/{idOdontologo}")
    public List<EvaluacionResponse> listarPorOdontologo(
            @PathVariable Integer idOdontologo) {

        return evaluacionRepository
                .findByOdontologoIdOdontologoWithRelations(idOdontologo)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // CREAR EVALUACIÓN
    // ============================================================

    @PostMapping
    public EvaluacionResponse crear(
            @Valid @RequestBody EvaluacionClinicaRequest request) {

        HistoriaClinica historia =
                historiaRepository
                        .findById(request.idHistoria())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Historia clínica no encontrada"));

        Odontologo odontologo =
                odontologoRepository
                        .findById(request.idOdontologo())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Odontólogo no encontrado"));

        EvaluacionClinica evaluacion =
                new EvaluacionClinica();

        evaluacion.setHistoria(historia);
        evaluacion.setOdontologo(odontologo);
        evaluacion.setFechaEvaluacion(
                request.fechaEvaluacion());
        evaluacion.setDiagnostico(
                request.diagnostico());
        evaluacion.setObservaciones(
                request.observaciones());
        evaluacion.setRecomendaciones(
                request.recomendaciones());

        EvaluacionClinica guardada =
                evaluacionRepository.save(evaluacion);

        EvaluacionClinica evaluacionCompleta =
                evaluacionRepository
                        .findByIdWithRelations(
                                guardada.getIdEvaluacion())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No se pudo recuperar la evaluación creada"));

        return convertirRespuesta(evaluacionCompleta);
    }

    // ============================================================
    // ACTUALIZAR EVALUACIÓN
    // ============================================================

    @PutMapping("/{id}")
    public EvaluacionResponse actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EvaluacionClinicaRequest request) {

        EvaluacionClinica evaluacion =
                evaluacionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evaluación clínica no encontrada"));

        HistoriaClinica historia =
                historiaRepository
                        .findById(request.idHistoria())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Historia clínica no encontrada"));

        Odontologo odontologo =
                odontologoRepository
                        .findById(request.idOdontologo())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Odontólogo no encontrado"));

        evaluacion.setHistoria(historia);
        evaluacion.setOdontologo(odontologo);
        evaluacion.setFechaEvaluacion(
                request.fechaEvaluacion());
        evaluacion.setDiagnostico(
                request.diagnostico());
        evaluacion.setObservaciones(
                request.observaciones());
        evaluacion.setRecomendaciones(
                request.recomendaciones());

        evaluacionRepository.save(evaluacion);

        EvaluacionClinica actualizada =
                evaluacionRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No se pudo recuperar la evaluación actualizada"));

        return convertirRespuesta(actualizada);
    }

    // ============================================================
    // ELIMINAR EVALUACIÓN
    // ============================================================

    @DeleteMapping("/{id}")
    public void eliminar(
            @PathVariable Integer id) {

        EvaluacionClinica evaluacion =
                evaluacionRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evaluación clínica no encontrada"));

        evaluacionRepository.delete(evaluacion);

        evaluacionRepository.flush();
    }

    // ============================================================
    // CONVERTIR ENTIDAD A RESPUESTA
    // ============================================================

    private EvaluacionResponse convertirRespuesta(
            EvaluacionClinica evaluacion) {

        HistoriaClinica historia =
                evaluacion.getHistoria();

        Odontologo odontologo =
                evaluacion.getOdontologo();

        String paciente = "";

        if (historia != null &&
                historia.getPaciente() != null) {

            paciente =
                    historia.getPaciente().getNombres()
                    + " "
                    + historia.getPaciente().getApellidos();
        }

        String odontologoNombre = "";

        if (odontologo != null) {

            odontologoNombre =
                    odontologo.getNombres()
                    + " "
                    + odontologo.getApellidos();
        }

        return new EvaluacionResponse(

                evaluacion.getIdEvaluacion(),

                historia != null
                        ? historia.getIdHistoria()
                        : null,

                historia != null
                        ? historia.getCodigoHistoria()
                        : null,

                paciente,

                odontologo != null
                        ? odontologo.getIdOdontologo()
                        : null,

                odontologoNombre,

                odontologo != null
                        ? odontologo.getEspecialidad()
                        : null,

                evaluacion.getFechaEvaluacion(),

                evaluacion.getDiagnostico(),

                evaluacion.getObservaciones(),

                evaluacion.getRecomendaciones()
        );
    }

    // ============================================================
    // DTO DE RESPUESTA
    // ============================================================

    public record EvaluacionResponse(

            Integer idEvaluacion,

            Integer idHistoria,

            String codigoHistoria,

            String paciente,

            Integer idOdontologo,

            String odontologo,

            String especialidad,

            LocalDate fechaEvaluacion,

            String diagnostico,

            String observaciones,

            String recomendaciones

    ) {}
}