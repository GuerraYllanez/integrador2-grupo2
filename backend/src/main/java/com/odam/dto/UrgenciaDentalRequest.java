package com.odam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UrgenciaDentalRequest {

    @NotNull(message = "El paciente es obligatorio")
    private Integer idPaciente;

    @NotNull(message = "La historia clínica es obligatoria")
    private Integer idHistoria;

    @NotBlank(message = "El tipo de urgencia es obligatorio")
    @Size(max = 100, message = "El tipo de urgencia no puede superar los 100 caracteres")
    private String tipoUrgencia;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @Size(max = 20, message = "El estado no puede superar los 20 caracteres")
    private String estado;

    public Integer getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(Integer idPaciente) {
        this.idPaciente = idPaciente;
    }

    public Integer getIdHistoria() {
        return idHistoria;
    }

    public void setIdHistoria(Integer idHistoria) {
        this.idHistoria = idHistoria;
    }

    public String getTipoUrgencia() {
        return tipoUrgencia;
    }

    public void setTipoUrgencia(String tipoUrgencia) {
        this.tipoUrgencia = tipoUrgencia;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}