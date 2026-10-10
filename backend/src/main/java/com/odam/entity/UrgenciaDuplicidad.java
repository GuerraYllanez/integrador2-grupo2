
package com.odam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "urgencias_duplicadas",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_urgencias_duplicadas_par",
            columnNames = {
                "id_urgencia_original",
                "id_urgencia_duplicada"
            }
        )
    }
)
public class UrgenciaDuplicidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_revision")
    private Integer idRevision;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_urgencia_original",
        nullable = false
    )
    private UrgenciaDental urgenciaOriginal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_urgencia_duplicada",
        nullable = false
    )
    private UrgenciaDental urgenciaDuplicada;

    @Column(
        name = "estado_revision",
        nullable = false,
        length = 30
    )
    private String estadoRevision = "CONFIRMADO_DUPLICADO";

    @Column(
        name = "fecha_revision",
        insertable = false,
        updatable = false
    )
    private LocalDateTime fechaRevision;

    public UrgenciaDuplicidad() {
    }

    public Integer getIdRevision() {
        return idRevision;
    }

    public UrgenciaDental getUrgenciaOriginal() {
        return urgenciaOriginal;
    }

    public void setUrgenciaOriginal(
            UrgenciaDental urgenciaOriginal) {
        this.urgenciaOriginal = urgenciaOriginal;
    }

    public UrgenciaDental getUrgenciaDuplicada() {
        return urgenciaDuplicada;
    }

    public void setUrgenciaDuplicada(
            UrgenciaDental urgenciaDuplicada) {
        this.urgenciaDuplicada = urgenciaDuplicada;
    }

    public String getEstadoRevision() {
        return estadoRevision;
    }

    public void setEstadoRevision(String estadoRevision) {
        this.estadoRevision = estadoRevision;
    }

    public LocalDateTime getFechaRevision() {
        return fechaRevision;
    }
}