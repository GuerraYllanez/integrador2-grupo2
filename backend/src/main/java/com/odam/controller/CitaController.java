package com.odam.controller;

import com.odam.dto.CitaRequest;
import com.odam.entity.Cita;
import com.odam.entity.Cita.EstadoCita;
import com.odam.entity.Odontologo;
import com.odam.entity.Paciente;
import com.odam.entity.PersonalAdministrativo;
import com.odam.entity.Servicio;
import com.odam.repository.CitaRepository;
import com.odam.repository.OdontologoRepository;
import com.odam.repository.PacienteRepository;
import com.odam.repository.PersonalAdministrativoRepository;
import com.odam.repository.ServicioRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class CitaController {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final OdontologoRepository odontologoRepository;
    private final PersonalAdministrativoRepository personalRepository;
    private final ServicioRepository servicioRepository;

    public CitaController(
            CitaRepository citaRepository,
            PacienteRepository pacienteRepository,
            OdontologoRepository odontologoRepository,
            PersonalAdministrativoRepository personalRepository,
            ServicioRepository servicioRepository) {

        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.odontologoRepository = odontologoRepository;
        this.personalRepository = personalRepository;
        this.servicioRepository = servicioRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<CitaResponse> listar() {

        return citaRepository.findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public CitaResponse obtener(
            @PathVariable Integer id) {

        Cita cita = citaRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cita no encontrada"
                        ));

        return convertirRespuesta(cita);
    }

    @PostMapping
    @Transactional
    public CitaResponse crear(
            @Valid @RequestBody CitaRequest request) {

        Paciente paciente = pacienteRepository.findById(
                request.idPaciente()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));

        Odontologo odontologo = odontologoRepository.findById(
                request.idOdontologo()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Odontólogo no encontrado"
                ));

        Servicio servicio = servicioRepository.findById(
                request.idServicio()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));

        PersonalAdministrativo personal = null;

        if (request.idPersonal() != null) {

            personal = personalRepository.findById(
                    request.idPersonal()
            ).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Personal administrativo no encontrado"
                    ));
        }

        validarHorarioAtencion(
                request.fechaCita(),
                request.horaCita()
        );

        validarCitaDuplicada(
                request.idOdontologo(),
                request.fechaCita(),
                request.horaCita(),
                null
        );

        Cita cita = new Cita();

        cita.setPaciente(paciente);
        cita.setOdontologo(odontologo);
        cita.setPersonal(personal);
        cita.setServicio(servicio);

        cita.setHorario(null);

        cita.setFechaCita(
                request.fechaCita()
        );

        cita.setHoraCita(
                request.horaCita()
        );

        cita.setMotivo(
                request.motivo()
        );

        cita.setEstado(
                request.estado() != null
                        ? request.estado()
                        : EstadoCita.PROGRAMADA
        );

        cita.setObservaciones(
                request.observaciones()
        );

        Cita citaGuardada =
                citaRepository.save(cita);

        return convertirRespuesta(citaGuardada);
    }

    @PutMapping("/{id}")
    @Transactional
    public CitaResponse actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody CitaRequest request) {

        Cita cita = citaRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cita no encontrada"
                        ));

        Paciente paciente = pacienteRepository.findById(
                request.idPaciente()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));

        Odontologo odontologo = odontologoRepository.findById(
                request.idOdontologo()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Odontólogo no encontrado"
                ));

        Servicio servicio = servicioRepository.findById(
                request.idServicio()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));

        PersonalAdministrativo personal = null;

        if (request.idPersonal() != null) {

            personal = personalRepository.findById(
                    request.idPersonal()
            ).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Personal administrativo no encontrado"
                    ));
        }

        validarHorarioAtencion(
                request.fechaCita(),
                request.horaCita()
        );

        validarCitaDuplicada(
                request.idOdontologo(),
                request.fechaCita(),
                request.horaCita(),
                id
        );

        cita.setPaciente(paciente);
        cita.setOdontologo(odontologo);
        cita.setPersonal(personal);
        cita.setServicio(servicio);

        cita.setHorario(null);

        cita.setFechaCita(
                request.fechaCita()
        );

        cita.setHoraCita(
                request.horaCita()
        );

        cita.setMotivo(
                request.motivo()
        );

        if (request.estado() != null) {
            cita.setEstado(
                    request.estado()
            );
        }

        cita.setObservaciones(
                request.observaciones()
        );

        Cita citaActualizada =
                citaRepository.save(cita);

        return convertirRespuesta(
                citaActualizada
        );
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void eliminar(
            @PathVariable Integer id) {

        Cita cita = citaRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cita no encontrada"
                        ));

        citaRepository.delete(cita);
        citaRepository.flush();
    }

    private void validarHorarioAtencion(
            LocalDate fecha,
            LocalTime hora) {

        if (fecha == null || hora == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha y hora de la cita son obligatorias"
            );
        }

        DayOfWeek dia =
                fecha.getDayOfWeek();

        if (dia == DayOfWeek.SUNDAY) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se pueden registrar citas los domingos"
            );
        }

        if (dia == DayOfWeek.MONDAY) {

            LocalTime inicio =
                    LocalTime.of(21, 0);

            LocalTime fin =
                    LocalTime.of(23, 59);

            if (hora.isBefore(inicio)
                    || hora.isAfter(fin)) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El lunes el horario de atención es de 9:00 PM a 12:00 AM"
                );
            }

            return;
        }

        LocalTime inicio =
                LocalTime.of(9, 0);

        LocalTime fin =
                LocalTime.of(19, 0);

        if (hora.isBefore(inicio)
                || hora.isAfter(fin)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "De martes a sábado el horario de atención es de 9:00 AM a 7:00 PM"
            );
        }
    }

    private void validarCitaDuplicada(
            Integer idOdontologo,
            LocalDate fecha,
            LocalTime hora,
            Integer idCitaActual) {

        boolean duplicada =
                citaRepository
                        .existsByIdOdontologoIdOdontologoAndFechaCitaAndHoraCitaAndIdCitaNot(
                                idOdontologo,
                                fecha,
                                hora,
                                idCitaActual
                        );

        if (duplicada) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El odontólogo ya tiene una cita registrada para esa fecha y hora"
            );
        }
    }

    private CitaResponse convertirRespuesta(
            Cita cita) {

        Paciente paciente =
                cita.getPaciente();

        Odontologo odontologo =
                cita.getOdontologo();

        PersonalAdministrativo personal =
                cita.getPersonal();

        Servicio servicio =
                cita.getServicio();

        String pacienteNombre = "";

        if (paciente != null) {

            pacienteNombre =
                    paciente.getNombres()
                    + " "
                    + paciente.getApellidos();
        }

        String odontologoNombre = "";

        if (odontologo != null) {

            odontologoNombre =
                    odontologo.getNombres()
                    + " "
                    + odontologo.getApellidos();
        }

        String personalNombre = "";

        if (personal != null) {

            personalNombre =
                    personal.getNombres()
                    + " "
                    + personal.getApellidos();
        }

        return new CitaResponse(
                cita.getIdCita(),

                paciente != null
                        ? paciente.getIdPaciente()
                        : null,

                pacienteNombre,

                paciente != null
                        ? paciente.getDocumento()
                        : null,

                odontologo != null
                        ? odontologo.getIdOdontologo()
                        : null,

                odontologoNombre,

                odontologo != null
                        ? odontologo.getEspecialidad()
                        : null,

                personal != null
                        ? personal.getIdPersonal()
                        : null,

                personalNombre,

                servicio != null
                        ? servicio.getIdServicio()
                        : null,

                servicio != null
                        ? servicio.getNombre()
                        : null,

                servicio != null
                        ? servicio.getPrecio()
                        : null,

                cita.getHorario() != null
                        ? cita.getHorario().getIdHorario()
                        : null,

                cita.getFechaCita(),
                cita.getHoraCita(),
                cita.getMotivo(),
                cita.getEstado(),
                cita.getObservaciones(),
                cita.getFechaRegistro()
        );
    }

    public record CitaResponse(
            Integer idCita,
            Integer idPaciente,
            String paciente,
            String documentoPaciente,
            Integer idOdontologo,
            String odontologo,
            String especialidad,
            Integer idPersonal,
            String personal,
            Integer idServicio,
            String servicio,
            java.math.BigDecimal precioServicio,
            Integer idHorario,
            LocalDate fechaCita,
            LocalTime horaCita,
            String motivo,
            EstadoCita estado,
            String observaciones,
            LocalDateTime fechaRegistro
    ) {
    }
}