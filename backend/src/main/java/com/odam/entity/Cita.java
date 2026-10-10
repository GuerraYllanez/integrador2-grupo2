package com.odam.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Integer idCita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_paciente",
        nullable = false
    )
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_odontologo",
        nullable = false
    )
    private Odontologo odontologo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_personal"
    )
    private PersonalAdministrativo personal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_servicio",
        nullable = false
    )
    private Servicio servicio;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_horario",
        unique = true
    )
    private Horario horario;

    @Column(
        name = "fecha",
        nullable = false
    )
    private LocalDate fechaCita;

    @Column(
        name = "hora",
        nullable = false
    )
    private LocalTime horaCita;

    @Column(length = 255)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCita estado = EstadoCita.PROGRAMADA;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(
        name = "fecha_creacion",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaRegistro;


    public Integer getIdCita() {
        return idCita;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Odontologo getOdontologo() {
        return odontologo;
    }

    public void setOdontologo(Odontologo odontologo) {
        this.odontologo = odontologo;
    }

    public PersonalAdministrativo getPersonal() {
        return personal;
    }

    public void setPersonal(PersonalAdministrativo personal) {
        this.personal = personal;
    }

    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }

    public LocalDate getFechaCita() {
        return fechaCita;
    }

    public void setFechaCita(LocalDate fechaCita) {
        this.fechaCita = fechaCita;
    }

    public LocalTime getHoraCita() {
        return horaCita;
    }

    public void setHoraCita(LocalTime horaCita) {
        this.horaCita = horaCita;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public EstadoCita getEstado() {
        return estado;
    }

    public void setEstado(EstadoCita estado) {
        this.estado = estado;
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


    public enum EstadoCita {
        PROGRAMADA,
        ATENDIDA,
        CANCELADA,
        REPROGRAMADA
    }
}