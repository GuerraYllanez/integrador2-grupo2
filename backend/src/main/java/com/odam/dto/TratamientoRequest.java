package com.odam.dto;

import com.odam.entity.EstadoTratamiento;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TratamientoRequest(

        @NotNull(message = "La historia clínica es obligatoria")
        Integer idHistoria,

        @NotNull(message = "El odontólogo es obligatorio")
        Integer idOdontologo,

        @NotNull(message = "El servicio es obligatorio")
        Integer idServicio,

        String descripcion,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        LocalDate fechaFin,

        EstadoTratamiento estado,

        String observaciones
) {
}