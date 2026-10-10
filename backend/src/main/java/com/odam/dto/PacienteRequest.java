package com.odam.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PacienteRequest(

    @NotBlank
    @Size(max = 100)
    @Pattern(
        regexp = "^[^<>]*$",
        message = "Los nombres no pueden contener etiquetas HTML"
    )
    String nombres,

    @NotBlank
    @Size(max = 100)
    @Pattern(
        regexp = "^[^<>]*$",
        message = "Los apellidos no pueden contener etiquetas HTML"
    )
    String apellidos,

    @NotBlank
    @Size(max = 20)
    String documento,

    @Size(max = 20)
    String telefono,

    @Email
    @Size(max = 150)
    String correo,

    LocalDate fechaNacimiento,

    @Size(max = 255)
    String direccion,

    @Pattern(
        regexp = "^(MASCULINO|FEMENINO|OTRO)$",
        message = "El sexo debe ser MASCULINO, FEMENINO u OTRO"
    )
    String sexo
) {}