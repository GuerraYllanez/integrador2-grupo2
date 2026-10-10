
package com.odam.dto;

import java.time.LocalDateTime;

public class AuditoriaResponse {

    private Integer idAuditoria;
    private Integer idUsuario;
    private String nombreUsuario;
    private String correo;
    private String accion;
    private String tablaAfectada;
    private Integer idRegistro;
    private String descripcion;
    private LocalDateTime fecha;

    public AuditoriaResponse() {
    }

    public AuditoriaResponse(
            Integer idAuditoria,
            Integer idUsuario,
            String nombreUsuario,
            String correo,
            String accion,
            String tablaAfectada,
            Integer idRegistro,
            String descripcion,
            LocalDateTime fecha) {

        this.idAuditoria = idAuditoria;
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.correo = correo;
        this.accion = accion;
        this.tablaAfectada = tablaAfectada;
        this.idRegistro = idRegistro;
        this.descripcion = descripcion;
        this.fecha = fecha;
    }

    public Integer getIdAuditoria() {
        return idAuditoria;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public String getCorreo() {
        return correo;
    }

    public String getAccion() {
        return accion;
    }

    public String getTablaAfectada() {
        return tablaAfectada;
    }

    public Integer getIdRegistro() {
        return idRegistro;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }
}