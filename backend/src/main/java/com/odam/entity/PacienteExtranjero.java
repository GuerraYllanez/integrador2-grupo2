package com.odam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes_extranjeros")
public class PacienteExtranjero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_extranjero")
    private Integer idExtranjero;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "id_paciente",
        nullable = false,
        unique = true
    )
    private Paciente paciente;

    @Column(nullable = false, length = 80)
    private String nacionalidad;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 50)
    private String numeroDocumento;

    @Column(nullable = false, length = 50)
    private String cobertura = "PARTICULAR";

    @Column(length = 100)
    private String especialidad;

    @Column(name = "estado_cobertura", nullable = false, length = 20)
    private String estadoCobertura = "PENDIENTE";

    @Column(name = "carta_garantia", nullable = false, length = 20)
    private String cartaGarantia = "NO_SOLICITADA";

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(
        name = "fecha_registro",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaRegistro;


    public Integer getIdExtranjero() {
        return idExtranjero;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
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

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
}