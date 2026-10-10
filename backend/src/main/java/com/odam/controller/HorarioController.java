package com.odam.controller;

import com.odam.entity.Horario;
import com.odam.entity.Horario.EstadoHorario;
import com.odam.entity.Odontologo;
import com.odam.repository.HorarioRepository;
import com.odam.repository.OdontologoRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class HorarioController {

    private final HorarioRepository horarioRepository;
    private final OdontologoRepository odontologoRepository;

    public HorarioController(
            HorarioRepository horarioRepository,
            OdontologoRepository odontologoRepository) {

        this.horarioRepository = horarioRepository;
        this.odontologoRepository = odontologoRepository;
    }

    // ============================================================
    // LISTAR
    // ============================================================

    @GetMapping
    @Transactional
    public List<HorarioResponse> listar() {

        return horarioRepository.findAllConOdontologo()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // OBTENER POR ID
    // ============================================================

    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<?> obtener(
            @PathVariable Integer id) {

        Horario horario = horarioRepository
                .findByIdConOdontologo(id)
                .orElse(null);

        if (horario == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(
                            "Horario no encontrado"
                    ));
        }

        return ResponseEntity.ok(
                convertirRespuesta(horario)
        );
    }

    // ============================================================
    // LISTAR DISPONIBLES
    // ============================================================

    @GetMapping("/disponibles")
    @Transactional
    public List<HorarioResponse> listarDisponibles() {

        return horarioRepository
                .findAllConOdontologo()
                .stream()
                .filter(horario ->
                        horario.getEstado()
                                == EstadoHorario.DISPONIBLE
                )
                .map(this::convertirRespuesta)
                .toList();
    }

    // ============================================================
    // CREAR
    // ============================================================

    @PostMapping
    @Transactional
    public ResponseEntity<?> crear(
            @RequestBody HorarioRequest request) {

        try {

            validarDatos(request);

            Odontologo odontologo =
                    odontologoRepository
                            .findById(request.idOdontologo())
                            .orElse(null);

            if (odontologo == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(
                                "Odontólogo no encontrado"
                        ));
            }

            validarConflicto(
                    request.idOdontologo(),
                    request.fecha(),
                    request.horaInicio(),
                    request.horaFin(),
                    null
            );

            Horario horario = new Horario();

            horario.setOdontologo(odontologo);
            horario.setFecha(request.fecha());
            horario.setHoraInicio(request.horaInicio());
            horario.setHoraFin(request.horaFin());

            horario.setEstado(
                    request.estado() != null
                            ? request.estado()
                            : EstadoHorario.DISPONIBLE
            );

            Horario guardado =
                    horarioRepository.save(horario);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(convertirRespuesta(guardado));

        } catch (HorarioConflictException ex) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            ex.getMessage()
                    ));

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(
                            ex.getMessage()
                    ));
        }
    }

    // ============================================================
    // ACTUALIZAR
    // ============================================================

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @RequestBody HorarioRequest request) {

        try {

            validarDatos(request);

            Horario horario =
                    horarioRepository
                            .findByIdConOdontologo(id)
                            .orElse(null);

            if (horario == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(
                                "Horario no encontrado"
                        ));
            }

            Odontologo odontologo =
                    odontologoRepository
                            .findById(request.idOdontologo())
                            .orElse(null);

            if (odontologo == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(
                                "Odontólogo no encontrado"
                        ));
            }

            validarConflicto(
                    request.idOdontologo(),
                    request.fecha(),
                    request.horaInicio(),
                    request.horaFin(),
                    id
            );

            horario.setOdontologo(odontologo);
            horario.setFecha(request.fecha());
            horario.setHoraInicio(request.horaInicio());
            horario.setHoraFin(request.horaFin());

            if (request.estado() != null) {
                horario.setEstado(request.estado());
            }

            Horario actualizado =
                    horarioRepository.save(horario);

            return ResponseEntity.ok(
                    convertirRespuesta(actualizado)
            );

        } catch (HorarioConflictException ex) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            ex.getMessage()
                    ));

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(
                            ex.getMessage()
                    ));
        }
    }

    // ============================================================
    // ELIMINAR
    // ============================================================

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id) {

        Horario horario =
                horarioRepository
                        .findById(id)
                        .orElse(null);

        if (horario == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(
                            "Horario no encontrado"
                    ));
        }

        if (horario.getEstado()
                == EstadoHorario.OCUPADO) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(
                            "No se puede eliminar un horario ocupado"
                    ));
        }

        horarioRepository.delete(horario);
        horarioRepository.flush();

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // VALIDAR DATOS
    // ============================================================

    private void validarDatos(
            HorarioRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Los datos del horario son obligatorios"
            );
        }

        if (request.idOdontologo() == null) {
            throw new IllegalArgumentException(
                    "El odontólogo es obligatorio"
            );
        }

        if (request.fecha() == null) {
            throw new IllegalArgumentException(
                    "La fecha es obligatoria"
            );
        }

        if (request.horaInicio() == null) {
            throw new IllegalArgumentException(
                    "La hora de inicio es obligatoria"
            );
        }

        if (request.horaFin() == null) {
            throw new IllegalArgumentException(
                    "La hora de fin es obligatoria"
            );
        }

        if (!request.horaInicio()
                .isBefore(request.horaFin())) {

            throw new IllegalArgumentException(
                    "La hora de inicio debe ser menor que la hora de fin"
            );
        }
    }

    // ============================================================
    // VALIDAR CONFLICTO DE HORARIOS
    // ============================================================

    private void validarConflicto(
            Integer idOdontologo,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            Integer idHorarioActual) {

        List<Horario> horarios =
                horarioRepository.findAll();

        boolean conflicto =
                horarios.stream()

                        // Solo horarios del mismo odontólogo
                        .filter(horario ->
                                horario.getOdontologo() != null
                        )

                        .filter(horario ->
                                horario.getOdontologo()
                                        .getIdOdontologo()
                                        .equals(idOdontologo)
                        )

                        // Misma fecha
                        .filter(horario ->
                                horario.getFecha()
                                        .equals(fecha)
                        )

                        // En edición, ignorar el propio horario
                        .filter(horario ->
                                idHorarioActual == null
                                        ||
                                !horario.getIdHorario()
                                        .equals(idHorarioActual)
                        )

                        // Verificar superposición
                        .anyMatch(horario ->
                                horaInicio.isBefore(
                                        horario.getHoraFin()
                                )
                                &&
                                horaFin.isAfter(
                                        horario.getHoraInicio()
                                )
                        );

        if (conflicto) {

            throw new HorarioConflictException(
                    "El odontólogo ya tiene un horario registrado que se cruza con el bloque seleccionado"
            );
        }
    }

    // ============================================================
    // CONVERTIR RESPUESTA
    // ============================================================

    private HorarioResponse convertirRespuesta(
            Horario horario) {

        Integer idOdontologo = null;
        String odontologo = "";

        if (horario.getOdontologo() != null) {

            idOdontologo =
                    horario.getOdontologo()
                            .getIdOdontologo();

            odontologo =
                    horario.getOdontologo()
                            .getNombres()
                    + " "
                    + horario.getOdontologo()
                            .getApellidos();
        }

        return new HorarioResponse(
                horario.getIdHorario(),
                idOdontologo,
                odontologo,
                horario.getFecha(),
                horario.getHoraInicio(),
                horario.getHoraFin(),
                horario.getEstado()
        );
    }

    // ============================================================
    // REQUEST
    // ============================================================

    public record HorarioRequest(
            Integer idOdontologo,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            EstadoHorario estado
    ) {
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    public record HorarioResponse(
            Integer idHorario,
            Integer idOdontologo,
            String odontologo,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            EstadoHorario estado
    ) {
    }

    // ============================================================
    // ERROR
    // ============================================================

    public record ErrorResponse(
            String message
    ) {
    }

    // ============================================================
    // EXCEPCIÓN DE CONFLICTO
    // ============================================================

    private static class HorarioConflictException
            extends RuntimeException {

        public HorarioConflictException(
                String message) {

            super(message);
        }
    }
}