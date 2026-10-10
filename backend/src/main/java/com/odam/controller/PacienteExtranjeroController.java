package com.odam.controller;

import com.odam.dto.PacienteExtranjeroRequest;
import com.odam.dto.PacienteExtranjeroResponse;
import com.odam.entity.Paciente;
import com.odam.entity.PacienteExtranjero;
import com.odam.repository.PacienteExtranjeroRepository;
import com.odam.repository.PacienteRepository;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes-extranjeros")
@CrossOrigin(origins = "http://localhost:5173")
public class PacienteExtranjeroController {

    private final PacienteExtranjeroRepository extranjeroRepository;
    private final PacienteRepository pacienteRepository;

    public PacienteExtranjeroController(
            PacienteExtranjeroRepository extranjeroRepository,
            PacienteRepository pacienteRepository) {

        this.extranjeroRepository = extranjeroRepository;
        this.pacienteRepository = pacienteRepository;
    }


    // ============================================================
    // LISTAR
    // ============================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<PacienteExtranjeroResponse>> listar() {

        List<PacienteExtranjeroResponse> respuesta =
                extranjeroRepository.findAll()
                        .stream()
                        .map(this::convertirResponse)
                        .toList();

        return ResponseEntity.ok(respuesta);
    }


    // ============================================================
    // OBTENER POR ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PacienteExtranjeroResponse> obtener(
            @PathVariable Integer id) {

        return extranjeroRepository.findById(id)
                .map(this::convertirResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // ============================================================
    // CREAR
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PacienteExtranjeroResponse> crear(
            @Valid @RequestBody PacienteExtranjeroRequest request) {

        Paciente paciente = pacienteRepository
                .findById(request.getIdPaciente())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "El paciente seleccionado no existe"
                        )
                );

        if (extranjeroRepository.existsByPaciente_IdPaciente(
                request.getIdPaciente())) {

            throw new IllegalArgumentException(
                    "El paciente ya está registrado como extranjero"
            );
        }

        if (extranjeroRepository.existsByNumeroDocumento(
                request.getNumeroDocumento())) {

            throw new IllegalArgumentException(
                    "El número de documento ya está registrado"
            );
        }

        PacienteExtranjero extranjero =
                new PacienteExtranjero();

        extranjero.setPaciente(paciente);
        extranjero.setNacionalidad(request.getNacionalidad());
        extranjero.setTipoDocumento(request.getTipoDocumento());
        extranjero.setNumeroDocumento(request.getNumeroDocumento());
        extranjero.setCobertura(
                request.getCobertura() == null ||
                request.getCobertura().isBlank()
                        ? "PARTICULAR"
                        : request.getCobertura()
        );
        extranjero.setEspecialidad(request.getEspecialidad());

        extranjero.setEstadoCobertura(
                request.getEstadoCobertura() == null ||
                request.getEstadoCobertura().isBlank()
                        ? "PENDIENTE"
                        : request.getEstadoCobertura()
        );

        extranjero.setCartaGarantia(
                request.getCartaGarantia() == null ||
                request.getCartaGarantia().isBlank()
                        ? "NO_SOLICITADA"
                        : request.getCartaGarantia()
        );

        extranjero.setObservaciones(
                request.getObservaciones()
        );

        return ResponseEntity.ok(
                convertirResponse(
                        extranjeroRepository.save(extranjero)
                )
        );
    }


    // ============================================================
    // ACTUALIZAR
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PacienteExtranjeroResponse> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PacienteExtranjeroRequest request) {

        PacienteExtranjero extranjero =
                extranjeroRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El registro de paciente extranjero no existe"
                                )
                        );

        if (!extranjero.getPaciente()
                .getIdPaciente()
                .equals(request.getIdPaciente())) {

            if (extranjeroRepository.existsByPaciente_IdPaciente(
                    request.getIdPaciente())) {

                throw new IllegalArgumentException(
                        "El paciente seleccionado ya está registrado como extranjero"
                );
            }

            Paciente paciente = pacienteRepository
                    .findById(request.getIdPaciente())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "El paciente seleccionado no existe"
                            )
                    );

            extranjero.setPaciente(paciente);
        }

        if (!extranjero.getNumeroDocumento()
                .equals(request.getNumeroDocumento())
                && extranjeroRepository.existsByNumeroDocumento(
                        request.getNumeroDocumento())) {

            throw new IllegalArgumentException(
                    "El número de documento ya está registrado"
            );
        }

        extranjero.setNacionalidad(request.getNacionalidad());
        extranjero.setTipoDocumento(request.getTipoDocumento());
        extranjero.setNumeroDocumento(request.getNumeroDocumento());
        extranjero.setCobertura(request.getCobertura());
        extranjero.setEspecialidad(request.getEspecialidad());

        if (request.getEstadoCobertura() != null
                && !request.getEstadoCobertura().isBlank()) {

            extranjero.setEstadoCobertura(
                    request.getEstadoCobertura()
            );
        }

        if (request.getCartaGarantia() != null
                && !request.getCartaGarantia().isBlank()) {

            extranjero.setCartaGarantia(
                    request.getCartaGarantia()
            );
        }

        extranjero.setObservaciones(
                request.getObservaciones()
        );

        return ResponseEntity.ok(
                convertirResponse(
                        extranjeroRepository.save(extranjero)
                )
        );
    }


    // ============================================================
    // VALIDAR COBERTURA
    // ============================================================

    @PutMapping("/{id}/validar-cobertura")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PacienteExtranjeroResponse>
    validarCobertura(@PathVariable Integer id) {

        PacienteExtranjero extranjero =
                extranjeroRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El registro de paciente extranjero no existe"
                                )
                        );

        extranjero.setEstadoCobertura("VALIDADA");

        return ResponseEntity.ok(
                convertirResponse(
                        extranjeroRepository.save(extranjero)
                )
        );
    }


    // ============================================================
    // SOLICITAR CARTA DE GARANTÍA
    // ============================================================

    @PutMapping("/{id}/solicitar-carta")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PacienteExtranjeroResponse>
    solicitarCartaGarantia(@PathVariable Integer id) {

        PacienteExtranjero extranjero =
                extranjeroRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El registro de paciente extranjero no existe"
                                )
                        );

        extranjero.setCartaGarantia("SOLICITADA");

        return ResponseEntity.ok(
                convertirResponse(
                        extranjeroRepository.save(extranjero)
                )
        );
    }


    // ============================================================
    // ELIMINAR
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id) {

        if (!extranjeroRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        extranjeroRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }


    // ============================================================
    // CONVERTIR ENTITY → RESPONSE
    // ============================================================

    private PacienteExtranjeroResponse convertirResponse(
            PacienteExtranjero extranjero) {

        PacienteExtranjeroResponse response =
                new PacienteExtranjeroResponse();

        response.setIdExtranjero(
                extranjero.getIdExtranjero()
        );

        Paciente paciente = extranjero.getPaciente();

        PacienteExtranjeroResponse.PacienteResponse
                pacienteResponse =
                new PacienteExtranjeroResponse.PacienteResponse();

        pacienteResponse.setIdPaciente(
                paciente.getIdPaciente()
        );

        pacienteResponse.setNombres(
                paciente.getNombres()
        );

        pacienteResponse.setApellidos(
                paciente.getApellidos()
        );

        pacienteResponse.setDocumento(
                paciente.getDocumento()
        );

        pacienteResponse.setTelefono(
                paciente.getTelefono()
        );

        pacienteResponse.setCorreo(
                paciente.getCorreo()
        );

        response.setPaciente(pacienteResponse);

        response.setNacionalidad(
                extranjero.getNacionalidad()
        );

        response.setTipoDocumento(
                extranjero.getTipoDocumento()
        );

        response.setNumeroDocumento(
                extranjero.getNumeroDocumento()
        );

        response.setCobertura(
                extranjero.getCobertura()
        );

        response.setEspecialidad(
                extranjero.getEspecialidad()
        );

        response.setEstadoCobertura(
                extranjero.getEstadoCobertura()
        );

        response.setCartaGarantia(
                extranjero.getCartaGarantia()
        );

        response.setObservaciones(
                extranjero.getObservaciones()
        );

        response.setFechaRegistro(
                extranjero.getFechaRegistro()
        );

        return response;
    }
}