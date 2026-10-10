
package com.odam.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RevisionDuplicidadRequest {

    @NotNull
    @Positive
    private Integer idUrgenciaOriginal;

    @NotNull
    @Positive
    private Integer idUrgenciaDuplicada;

    public Integer getIdUrgenciaOriginal() {
        return idUrgenciaOriginal;
    }

    public void setIdUrgenciaOriginal(Integer idUrgenciaOriginal) {
        this.idUrgenciaOriginal = idUrgenciaOriginal;
    }

    public Integer getIdUrgenciaDuplicada() {
        return idUrgenciaDuplicada;
    }

    public void setIdUrgenciaDuplicada(Integer idUrgenciaDuplicada) {
        this.idUrgenciaDuplicada = idUrgenciaDuplicada;
    }
}