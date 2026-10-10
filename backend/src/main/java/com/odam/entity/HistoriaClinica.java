package com.odam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historias_clinicas")
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historia")
    private Integer idHistoria;

    // ============================================================
    // PACIENTE
    // ============================================================

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "id_paciente",
        nullable = false,
        unique = true
    )
    private Paciente paciente;

    // ============================================================
    // DATOS DE LA HISTORIA
    // ============================================================

    @Column(
        name = "codigo_historia",
        nullable = false,
        unique = true,
        length = 50
    )
    private String codigoHistoria;

    @Column(columnDefinition = "TEXT")
    private String antecedentes;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // ============================================================
    // FECHAS
    // ============================================================

    @Column(
        name = "fecha_creacion",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaCreacion;

    @Column(
        name = "fecha_actualizacion",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaActualizacion;

    // ============================================================
    // CONSTRUCTORES
    // ============================================================

    public HistoriaClinica() {
    }

    // ============================================================
    // GETTERS Y SETTERS
    // ============================================================

    public Integer getIdHistoria() {
        return idHistoria;
    }

    public void setIdHistoria(Integer idHistoria) {
        this.idHistoria = idHistoria;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public String getCodigoHistoria() {
        return codigoHistoria;
    }

    public void setCodigoHistoria(String codigoHistoria) {
        this.codigoHistoria = codigoHistoria;
    }

    public String getAntecedentes() {
        return antecedentes;
    }

    public void setAntecedentes(String antecedentes) {
        this.antecedentes = antecedentes;
    }

    public String getAlergias() {
        return alergias;
    }

    public void setAlergias(String alergias) {
        this.alergias = alergias;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}