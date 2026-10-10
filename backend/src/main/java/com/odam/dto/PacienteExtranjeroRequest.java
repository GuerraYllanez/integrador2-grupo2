package com.odam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PacienteExtranjeroRequest {

    @NotNull(message = "El paciente es obligatorio")
    private Integer idPaciente;

    @NotBlank(message = "La nacionalidad es obligatoria")
    @Size(max = 80, message = "La nacionalidad no puede superar los 80 caracteres")
    private String nacionalidad;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Size(max = 20, message = "El tipo de documento no puede superar los 20 caracteres")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 50, message = "El número de documento no puede superar los 50 caracteres")
    private String numeroDocumento;

    @NotBlank(message = "La cobertura es obligatoria")
    @Size(max = 50, message = "La cobertura no puede superar los 50 caracteres")
    private String cobertura;

    @Size(max = 100, message = "La especialidad no puede superar los 100 caracteres")
    private String especialidad;

    @Size(max = 20, message = "El estado de cobertura no puede superar los 20 caracteres")
    private String estadoCobertura;

    @Size(max = 20, message = "El estado de carta de garantía no puede superar los 20 caracteres")
    private String cartaGarantia;

    private String observaciones;


    public Integer getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(Integer idPaciente) {
        this.idPaciente = idPaciente;
    }

    public String getNacionalidad() {
        return nacionalidad;
    }

    public void setNacionalidad(String nacionalidad) {
        this.nacionalidad = nacionalidad;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public String getCobertura() {
        return cobertura;
    }

    public void setCobertura(String cobertura) {
        this.cobertura = cobertura;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getEstadoCobertura() {
        return estadoCobertura;
    }

    public void setEstadoCobertura(String estadoCobertura) {
        this.estadoCobertura = estadoCobertura;
    }

    public String getCartaGarantia() {
        return cartaGarantia;
    }

    public void setCartaGarantia(String cartaGarantia) {
        this.cartaGarantia = cartaGarantia;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}