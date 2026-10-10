
package com.odam.service;

import com.odam.dto.AuditoriaResponse;
import com.odam.entity.Auditoria;
import com.odam.entity.Usuario;
import com.odam.repository.AuditoriaRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;

    public AuditoriaService(
            AuditoriaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponse> listar() {

        return auditoriaRepository.findAll(
                Sort.by(Sort.Direction.DESC, "fecha")
        ).stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<AuditoriaResponse> obtenerPorId(
            Integer id) {

        return auditoriaRepository.findById(id)
                .map(this::convertirRespuesta);
    }

    private AuditoriaResponse convertirRespuesta(
            Auditoria auditoria) {

        Usuario usuario = auditoria.getUsuario();

        Integer idUsuario = null;
        String nombreUsuario = "Usuario no disponible";
        String correo = null;

        if (usuario != null) {
            idUsuario = usuario.getIdUsuario();
            nombreUsuario = usuario.getNombreUsuario();
            correo = usuario.getCorreo();
        }

        return new AuditoriaResponse(
                auditoria.getIdAuditoria(),
                idUsuario,
                nombreUsuario,
                correo,
                auditoria.getAccion(),
                auditoria.getTablaAfectada(),
                auditoria.getIdRegistro(),
                auditoria.getDescripcion(),
                auditoria.getFecha()
        );
    }
}