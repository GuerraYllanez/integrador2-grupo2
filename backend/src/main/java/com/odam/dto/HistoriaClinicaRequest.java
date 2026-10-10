package com.odam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HistoriaClinicaRequest(

        @NotNull(message = "El paciente es obligatorio")
        Integer idPaciente,

        @NotBlank(message = "El código de historia es obligatorio")
        @Size(max = 50, message = "El código de historia no puede superar los 50 caracteres")
        String codigoHistoria,

        String antecedentes,

        String alergias,

        String observaciones
) {
}