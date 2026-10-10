package com.odam.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reprogramaciones")
public class Reprogramacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reprogramacion")
    private Integer idReprogramacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_cita",
        nullable = false
    )
    private Cita cita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(
        name = "fecha_anterior",
        nullable = false
    )
    private LocalDate fechaAnterior;

    @Column(
        name = "hora_anterior",
        nullable = false
    )
    private LocalTime horaAnterior;

    @Column(
        name = "nueva_fecha",
        nullable = false
    )
    private LocalDate nuevaFecha;

    @Column(
        name = "nueva_hora",
        nullable = false
    )
    private LocalTime nuevaHora;

    @Column(length = 255)
    private String motivo;

    @Column(
        name = "fecha_reprogramacion",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaReprogramacion;


    public Integer getIdReprogramacion() {
        return idReprogramacion;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDate getFechaAnterior() {
        return fechaAnterior;
    }

    public void setFechaAnterior(LocalDate fechaAnterior) {
        this.fechaAnterior = fechaAnterior;
    }

    public LocalTime getHoraAnterior() {
        return horaAnterior;
    }

    public void setHoraAnterior(LocalTime horaAnterior) {
        this.horaAnterior = horaAnterior;
    }

    public LocalDate getNuevaFecha() {
        return nuevaFecha;
    }

    public void setNuevaFecha(LocalDate nuevaFecha) {
        this.nuevaFecha = nuevaFecha;
    }

    public LocalTime getNuevaHora() {
        return nuevaHora;
    }

    public void setNuevaHora(LocalTime nuevaHora) {
        this.nuevaHora = nuevaHora;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFechaReprogramacion() {
        return fechaReprogramacion;
    }
}