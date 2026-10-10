package com.odam.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EvaluacionClinicaRequest(

        @NotNull(message = "La historia clínica es obligatoria")
        Integer idHistoria,

        @NotNull(message = "El odontólogo es obligatorio")
        Integer idOdontologo,

        @NotNull(message = "La fecha de evaluación es obligatoria")
        LocalDate fechaEvaluacion,

        String diagnostico,

        String observaciones,

        String recomendaciones
) {
}