package com.odam.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReprogramacionRequest(

    @NotNull(message = "La cita es obligatoria")
    Integer idCita,

    @NotNull(message = "La nueva fecha es obligatoria")
    LocalDate nuevaFecha,

    @NotNull(message = "La nueva hora es obligatoria")
    LocalTime nuevaHora,

    String motivo

) {
}