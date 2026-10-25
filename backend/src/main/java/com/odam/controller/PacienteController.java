package com.odam.controller;

import com.odam.dto.PacienteRequest;
import com.odam.entity.Auditoria;
import com.odam.entity.Paciente;
import com.odam.repository.AuditoriaRepository;
import com.odam.repository.CitaRepository;
import com.odam.repository.HistoriaClinicaRepository;
import com.odam.repository.PacienteExtranjeroRepository;
import com.odam.repository.PacienteRepository;
import com.odam.repository.PagoRepository;
import com.odam.repository.UrgenciaDentalRepository;
import com.odam.repository.UsuarioRepository;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pacientes")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class PacienteController {

    private final PacienteRepository repo;
    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CitaRepository citaRepository;
    private final HistoriaClinicaRepository historiaRepository;
    private final PacienteExtranjeroRepository extranjeroRepository;
    private final PagoRepository pagoRepository;
    private final UrgenciaDentalRepository urgenciaRepository;

    public PacienteController(
            PacienteRepository repo,
            AuditoriaRepository auditoriaRepository,
            UsuarioRepository usuarioRepository,
            CitaRepository citaRepository,
            HistoriaClinicaRepository historiaRepository,
            PacienteExtranjeroRepository extranjeroRepository,
            PagoRepository pagoRepository,
            UrgenciaDentalRepository urgenciaRepository) {

        this.repo = repo;
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.citaRepository = citaRepository;
        this.historiaRepository = historiaRepository;
        this.extranjeroRepository = extranjeroRepository;
        this.pagoRepository = pagoRepository;
        this.urgenciaRepository = urgenciaRepository;
    }

    @GetMapping
    public List<Paciente> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> obtener(@PathVariable Integer id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody PacienteRequest r) {

        if (repo.existsByDocumento(r.documento())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje",
                            "Ya existe un paciente con ese documento."));
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
                        + guardado.getApellidos());

        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PacienteRequest r) {

        return repo.findById(id)
                .<ResponseEntity<?>>map(paciente -> {

                    if (!paciente.getDocumento().equals(r.documento())
                            && repo.existsByDocumento(r.documento())) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("mensaje",
                                        "El documento ya está registrado."));
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
                                    + actualizado.getApellidos());

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> desactivar(@PathVariable Integer id) {

        return repo.findById(id)
                .<ResponseEntity<?>>map(paciente -> {

                    if (Boolean.FALSE.equals(paciente.getEstado())) {
                        return ResponseEntity.noContent().build();
                    }

                    paciente.setEstado(false);
                    repo.save(paciente);

                    registrarAuditoria(
                            "DESACTIVAR_PACIENTE",
                            id,
                            "Se desactivó al paciente: "
                                    + paciente.getNombres() + " "
                                    + paciente.getApellidos());

                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activar")
    @Transactional
    public ResponseEntity<?> activar(@PathVariable Integer id) {

        return repo.findById(id)
                .<ResponseEntity<?>>map(paciente -> {

                    if (Boolean.TRUE.equals(paciente.getEstado())) {
                        return ResponseEntity.ok(paciente);
                    }

                    paciente.setEstado(true);
                    Paciente actualizado = repo.save(paciente);

                    registrarAuditoria(
                            "ACTIVAR_PACIENTE",
                            id,
                            "Se activó al paciente: "
                                    + paciente.getNombres() + " "
                                    + paciente.getApellidos());

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/eliminar")
    @Transactional
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {

        Paciente paciente = repo.findById(id).orElse(null);

        if (paciente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", "El paciente no existe."));
        }

        // Comprobar todas las relaciones directas relevantes.
        if (historiaRepository.existsByPacienteIdPaciente(id)) {
            return conflicto(
                    "No se puede eliminar: el paciente tiene historia clínica.");
        }

        if (citaRepository.existsByPaciente_IdPaciente(id)) {
            return conflicto(
                    "No se puede eliminar: el paciente tiene citas registradas.");
        }

        if (extranjeroRepository.existsByPaciente_IdPaciente(id)) {
            return conflicto(
                    "No se puede eliminar: existe un registro de paciente extranjero.");
        }

        if (pagoRepository.existsByPaciente_IdPaciente(id)) {
            return conflicto(
                    "No se puede eliminar: el paciente tiene pagos registrados.");
        }

        if (urgenciaRepository.existsByPaciente_IdPaciente(id)) {
            return conflicto(
                    "No se puede eliminar: el paciente tiene urgencias registradas.");
        }

        // Registrar la acción antes de eliminar al paciente.
        registrarAuditoria(
                "ELIMINAR_PACIENTE",
                id,
                "Eliminación física del paciente: "
                        + paciente.getNombres() + " "
                        + paciente.getApellidos()
                        + ". El usuario asociado no fue eliminado.");

        repo.delete(paciente);
        repo.flush();

        return ResponseEntity.ok(
                Map.of("mensaje",
                        "Paciente eliminado correctamente. "
                                + "El usuario asociado, si existe, se conservó."));
    }

    private ResponseEntity<Map<String, String>> conflicto(String mensaje) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", mensaje));
    }

    private void registrarAuditoria(
            String accion,
            Integer idPaciente,
            String descripcion) {

        Auditoria registro = new Auditoria();

        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();

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