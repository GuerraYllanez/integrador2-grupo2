package com.odam.dto;

import com.odam.entity.Pago.EstadoPago;
import com.odam.entity.Pago.MetodoPago;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PagoRequest(

        @NotNull(message = "El paciente es obligatorio")
        Integer idPaciente,

        Integer idCita,

        @NotNull(message = "El servicio es obligatorio")
        Integer idServicio,

        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(
                value = "0.01",
                message = "El monto debe ser mayor que cero"
        )
        BigDecimal monto,

        @NotNull(message = "El método de pago es obligatorio")
        MetodoPago metodoPago,

        EstadoPago estado,

        String referencia,

        String observaciones
) {
}