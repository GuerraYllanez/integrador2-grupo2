package com.odam.dto;

import java.time.LocalDateTime;

public class UrgenciaDentalResponse {

    private Integer idUrgencia;

    private PacienteResponse paciente;

    private HistoriaResponse historiaClinica;

    private String tipoUrgencia;

    private String descripcion;

    private String estado;

    private LocalDateTime fechaRegistro;

    public Integer getIdUrgencia() {
        return idUrgencia;
    }

    public void setIdUrgencia(Integer idUrgencia) {
        this.idUrgencia = idUrgencia;
    }

    public PacienteResponse getPaciente() {
        return paciente;
    }

    public void setPaciente(PacienteResponse paciente) {
        this.paciente = paciente;
    }

    public HistoriaResponse getHistoriaClinica() {
        return historiaClinica;
    }

    public void setHistoriaClinica(HistoriaResponse historiaClinica) {
        this.historiaClinica = historiaClinica;
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

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public static class PacienteResponse {

        private Integer idPaciente;
        private String nombres;
        private String apellidos;
        private String documento;

        public Integer getIdPaciente() {
            return idPaciente;
        }

        public void setIdPaciente(Integer idPaciente) {
            this.idPaciente = idPaciente;
        }

        public String getNombres() {
            return nombres;
        }

        public void setNombres(String nombres) {
            this.nombres = nombres;
        }

        public String getApellidos() {
            return apellidos;
        }

        public void setApellidos(String apellidos) {
            this.apellidos = apellidos;
        }

        public String getDocumento() {
            return documento;
        }

        public void setDocumento(String documento) {
            this.documento = documento;
        }
    }

    public static class HistoriaResponse {

        private Integer idHistoria;
        private String codigoHistoria;

        public Integer getIdHistoria() {
            return idHistoria;
        }

        public void setIdHistoria(Integer idHistoria) {
            this.idHistoria = idHistoria;
        }

        public String getCodigoHistoria() {
            return codigoHistoria;
        }

        public void setCodigoHistoria(String codigoHistoria) {
            this.codigoHistoria = codigoHistoria;
        }
    }
}