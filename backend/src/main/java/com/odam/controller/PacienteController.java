package com.odam.controller;

import com.odam.dto.PacienteRequest;
import com.odam.entity.Auditoria;
import com.odam.entity.Paciente;
import com.odam.entity.Usuario;
import com.odam.repository.AuditoriaRepository;
import com.odam.repository.PacienteRepository;
import com.odam.repository.UsuarioRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class PacienteController {

    private final PacienteRepository repo;
    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public PacienteController(
            PacienteRepository repo,
            AuditoriaRepository auditoriaRepository,
            UsuarioRepository usuarioRepository) {
        this.repo = repo;
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ============================================================
    // LISTAR PACIENTES
    // ============================================================

    @GetMapping
    public List<Paciente> listar() {
        return repo.findAll();
    }

    // ============================================================
    // OBTENER PACIENTE POR ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> obtener(
            @PathVariable Integer id) {

        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============================================================
    // CREAR PACIENTE
    // ============================================================

    @PostMapping
    public ResponseEntity<Paciente> crear(
            @Valid @RequestBody PacienteRequest r) {

        if (repo.existsByDocumento(r.documento())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Paciente p = new Paciente();

        p.setNombres(r.nombres());
        p.setApellidos(r.apellidos());
        p.setDocumento(r.documento());
        p.setTelefono(r.telefono());
        p.setCorreo(r.correo());
        p.setFechaNacimiento(r.fechaNacimiento());
        p.setDireccion(r.direccion());
        p.setSexo(r.sexo());
        p.setEstado(true);

        Paciente guardado = repo.save(p);

        registrarAuditoria(
                "CREAR_PACIENTE",
                guardado.getIdPaciente(),
                "Se creó el paciente: "
                        + guardado.getNombres() + " "
                        + guardado.getApellidos()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // ============================================================
    // EDITAR PACIENTE
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PacienteRequest r) {

        return repo.findById(id)
                .map(paciente -> {

                    if (!paciente.getDocumento().equals(r.documento())
                            && repo.existsByDocumento(r.documento())) {
                        return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .<Paciente>build();
                    }

                    paciente.setNombres(r.nombres());
                    paciente.setApellidos(r.apellidos());
                    paciente.setDocumento(r.documento());
                    paciente.setTelefono(r.telefono());
                    paciente.setCorreo(r.correo());
                    paciente.setFechaNacimiento(r.fechaNacimiento());
                    paciente.setDireccion(r.direccion());
                    paciente.setSexo(r.sexo());

                    Paciente actualizado = repo.save(paciente);

                    registrarAuditoria(
                            "ACTUALIZAR_PACIENTE",
                            actualizado.getIdPaciente(),
                            "Se actualizaron los datos del paciente: "
                                    + actualizado.getNombres() + " "
                                    + actualizado.getApellidos()
                    );

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============================================================
    // DESACTIVAR PACIENTE (ELIMINACIÓN LÓGICA)
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
            @PathVariable Integer id) {

        return repo.findById(id)
                .map(paciente -> {

                    paciente.setEstado(false);
                    repo.save(paciente);

                    registrarAuditoria(
                            "DESACTIVAR_PACIENTE",
                            paciente.getIdPaciente(),
                            "Se desactivó el paciente: "
                                    + paciente.getNombres() + " "
                                    + paciente.getApellidos()
                    );

                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============================================================
    // ACTIVAR PACIENTE
    // ============================================================

    @PutMapping("/{id}/activar")
    public ResponseEntity<Paciente> activar(
            @PathVariable Integer id) {

        return repo.findById(id)
                .map(paciente -> {

                    paciente.setEstado(true);
                    Paciente actualizado = repo.save(paciente);

                    registrarAuditoria(
                            "ACTIVAR_PACIENTE",
                            actualizado.getIdPaciente(),
                            "Se activó el paciente: "
                                    + actualizado.getNombres() + " "
                                    + actualizado.getApellidos()
                    );

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============================================================
    // ELIMINAR PACIENTE DEFINITIVAMENTE
    // ============================================================

    @DeleteMapping("/{id}/eliminar")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id) {

        return repo.findById(id)
                .map(paciente -> {

                    Integer idPaciente = paciente.getIdPaciente();
                    String nombrePaciente =
                            paciente.getNombres() + " "
                                    + paciente.getApellidos();

                    repo.delete(paciente);
                    repo.flush();

                    registrarAuditoria(
                            "ELIMINAR_PACIENTE",
                            idPaciente,
                            "Se eliminó definitivamente el paciente: "
                                    + nombrePaciente
                    );

                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ============================================================
    // REGISTRAR EVENTO DE AUDITORÍA
    // ============================================================

    private void registrarAuditoria(
            String accion,
            Integer idPaciente,
            String descripcion) {

        Auditoria registro = new Auditoria();

        Authentication autenticacion =
                SecurityContextHolder.getContext().getAuthentication();

        if (autenticacion != null
                && autenticacion.isAuthenticated()
                && !"anonymousUser".equals(autenticacion.getName())) {

            usuarioRepository.findByCorreo(autenticacion.getName())
                    .ifPresent(registro::setUsuario);
        }

        registro.setAccion(accion);
        registro.setTablaAfectada("pacientes");
        registro.setIdRegistro(idPaciente);
        registro.setDescripcion(descripcion);

        auditoriaRepository.save(registro);
    }
}