package com.odam.dto;

import com.odam.entity.Cita.EstadoCita;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record CitaRequest(

        @NotNull(message = "El paciente es obligatorio")
        Integer idPaciente,

        @NotNull(message = "El odontólogo es obligatorio")
        Integer idOdontologo,

        Integer idPersonal,

        @NotNull(message = "El servicio es obligatorio")
        Integer idServicio,

        Integer idHorario,

        @NotNull(message = "La fecha de la cita es obligatoria")
        LocalDate fechaCita,

        @NotNull(message = "La hora de la cita es obligatoria")
        LocalTime horaCita,

        String motivo,

        EstadoCita estado,

        String observaciones
) {
}