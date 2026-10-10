package com.odam.controller;

import com.odam.dto.TratamientoRequest;
import com.odam.entity.EstadoTratamiento;
import com.odam.entity.HistoriaClinica;
import com.odam.entity.Odontologo;
import com.odam.entity.Servicio;
import com.odam.entity.Tratamiento;
import com.odam.repository.HistoriaClinicaRepository;
import com.odam.repository.OdontologoRepository;
import com.odam.repository.ServicioRepository;
import com.odam.repository.TratamientoRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tratamientos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class TratamientoController {

    private final TratamientoRepository tratamientoRepository;
    private final HistoriaClinicaRepository historiaRepository;
    private final OdontologoRepository odontologoRepository;
    private final ServicioRepository servicioRepository;

    public TratamientoController(
            TratamientoRepository tratamientoRepository,
            HistoriaClinicaRepository historiaRepository,
            OdontologoRepository odontologoRepository,
            ServicioRepository servicioRepository) {

        this.tratamientoRepository = tratamientoRepository;
        this.historiaRepository = historiaRepository;
        this.odontologoRepository = odontologoRepository;
        this.servicioRepository = servicioRepository;
    }

    // ============================================================
    // LISTAR TODOS
    // ============================================================

    @GetMapping
    public List<TratamientoResponse> listar() {

        return tratamientoRepository
                .findAllWithRelations()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // OBTENER POR ID
    // ============================================================

    @GetMapping("/{id}")
    public TratamientoResponse obtener(
            @PathVariable Integer id) {

        Tratamiento tratamiento =
                tratamientoRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tratamiento no encontrado"));

        return convertirRespuesta(tratamiento);
    }

    // ============================================================
    // LISTAR POR HISTORIA CLÍNICA
    // ============================================================

    @GetMapping("/historia/{idHistoria}")
    public List<TratamientoResponse> listarPorHistoria(
            @PathVariable Integer idHistoria) {

        return tratamientoRepository
                .findByHistoriaIdHistoriaWithRelations(idHistoria)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // LISTAR POR ODONTÓLOGO
    // ============================================================

    @GetMapping("/odontologo/{idOdontologo}")
    public List<TratamientoResponse> listarPorOdontologo(
            @PathVariable Integer idOdontologo) {

        return tratamientoRepository
                .findByOdontologoIdOdontologoWithRelations(idOdontologo)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // LISTAR POR ESTADO
    // ============================================================

    @GetMapping("/estado/{estado}")
    public List<TratamientoResponse> listarPorEstado(
            @PathVariable EstadoTratamiento estado) {

        return tratamientoRepository
                .findByEstadoWithRelations(estado)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // CREAR TRATAMIENTO
    // ============================================================

    @PostMapping
    public TratamientoResponse crear(
            @Valid @RequestBody TratamientoRequest request) {

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

        Servicio servicio =
                servicioRepository
                        .findById(request.idServicio())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Servicio no encontrado"));

        Tratamiento tratamiento =
                new Tratamiento();

        tratamiento.setHistoria(historia);
        tratamiento.setOdontologo(odontologo);
        tratamiento.setServicio(servicio);
        tratamiento.setDescripcion(request.descripcion());
        tratamiento.setFechaInicio(request.fechaInicio());
        tratamiento.setFechaFin(request.fechaFin());

        if (request.estado() != null) {
            tratamiento.setEstado(request.estado());
        } else {
            tratamiento.setEstado(
                    EstadoTratamiento.PENDIENTE
            );
        }

        tratamiento.setObservaciones(
                request.observaciones()
        );

        Tratamiento guardado =
                tratamientoRepository.save(tratamiento);

        Tratamiento tratamientoCompleto =
                tratamientoRepository
                        .findByIdWithRelations(
                                guardado.getIdTratamiento())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No se pudo recuperar el tratamiento creado"));

        return convertirRespuesta(tratamientoCompleto);
    }

    // ============================================================
    // ACTUALIZAR TRATAMIENTO
    // ============================================================

    @PutMapping("/{id}")
    public TratamientoResponse actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody TratamientoRequest request) {

        Tratamiento tratamiento =
                tratamientoRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tratamiento no encontrado"));

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

        Servicio servicio =
                servicioRepository
                        .findById(request.idServicio())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Servicio no encontrado"));

        tratamiento.setHistoria(historia);
        tratamiento.setOdontologo(odontologo);
        tratamiento.setServicio(servicio);
        tratamiento.setDescripcion(request.descripcion());
        tratamiento.setFechaInicio(request.fechaInicio());
        tratamiento.setFechaFin(request.fechaFin());

        if (request.estado() != null) {
            tratamiento.setEstado(request.estado());
        }

        tratamiento.setObservaciones(
                request.observaciones()
        );

        tratamientoRepository.save(tratamiento);

        Tratamiento actualizado =
                tratamientoRepository
                        .findByIdWithRelations(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No se pudo recuperar el tratamiento actualizado"));

        return convertirRespuesta(actualizado);
    }

    // ============================================================
    // ELIMINAR
    // ============================================================

    @DeleteMapping("/{id}")
    public void eliminar(
            @PathVariable Integer id) {

        Tratamiento tratamiento =
                tratamientoRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Tratamiento no encontrado"));

        tratamientoRepository.delete(tratamiento);
        tratamientoRepository.flush();
    }

    // ============================================================
    // CONVERTIR A RESPUESTA
    // ============================================================

    private TratamientoResponse convertirRespuesta(
            Tratamiento tratamiento) {

        HistoriaClinica historia =
                tratamiento.getHistoria();

        Odontologo odontologo =
                tratamiento.getOdontologo();

        Servicio servicio =
                tratamiento.getServicio();

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

        return new TratamientoResponse(

                tratamiento.getIdTratamiento(),

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

                servicio != null
                        ? servicio.getIdServicio()
                        : null,

                servicio != null
                        ? servicio.getNombre()
                        : null,

                servicio != null
                        ? servicio.getPrecio()
                        : null,

                tratamiento.getDescripcion(),

                tratamiento.getFechaInicio(),

                tratamiento.getFechaFin(),

                tratamiento.getEstado(),

                tratamiento.getObservaciones()
        );
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    public record TratamientoResponse(

            Integer idTratamiento,

            Integer idHistoria,

            String codigoHistoria,

            String paciente,

            Integer idOdontologo,

            String odontologo,

            String especialidad,

            Integer idServicio,

            String servicio,

            java.math.BigDecimal precioServicio,

            String descripcion,

            LocalDate fechaInicio,

            LocalDate fechaFin,

            EstadoTratamiento estado,

            String observaciones
    ) {
    }
}