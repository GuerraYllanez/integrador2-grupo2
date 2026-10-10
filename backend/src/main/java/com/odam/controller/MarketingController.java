package com.odam.controller;

import com.odam.dto.MarketingRequest;
import com.odam.entity.Marketing;
import com.odam.repository.MarketingRepository;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing")
@CrossOrigin(origins = "http://localhost:5173")
public class MarketingController {

    private final MarketingRepository marketingRepository;

    public MarketingController(
            MarketingRepository marketingRepository) {
        this.marketingRepository = marketingRepository;
    }

    // ============================================================
    // LISTAR
    // ============================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Marketing>> listar() {
        return ResponseEntity.ok(
                marketingRepository.findAll()
        );
    }

    // ============================================================
    // OBTENER POR ID
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Marketing> obtener(
            @PathVariable Integer id) {

        return marketingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // CREAR
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Marketing> crear(
            @Valid @RequestBody MarketingRequest request) {

        Marketing marketing = new Marketing();

        marketing.setNombreCampana(
                request.getNombreCampana().trim()
        );

        marketing.setDescripcion(
                request.getDescripcion()
        );

        marketing.setFechaInicio(
                request.getFechaInicio()
        );

        marketing.setFechaFin(
                request.getFechaFin()
        );

        marketing.setEstado(
                request.getEstado() == null
                        ? true
                        : request.getEstado()
        );

        Marketing guardado =
                marketingRepository.save(marketing);

        return ResponseEntity.ok(guardado);
    }

    // ============================================================
    // ACTUALIZAR
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody MarketingRequest request) {

        return marketingRepository.findById(id)
                .map(marketing -> {

                    marketing.setNombreCampana(
                            request.getNombreCampana().trim()
                    );

                    marketing.setDescripcion(
                            request.getDescripcion()
                    );

                    marketing.setFechaInicio(
                            request.getFechaInicio()
                    );

                    marketing.setFechaFin(
                            request.getFechaFin()
                    );

                    marketing.setEstado(
                            request.getEstado() == null
                                    ? marketing.getEstado()
                                    : request.getEstado()
                    );

                    Marketing actualizado =
                            marketingRepository.save(marketing);

                    return ResponseEntity.ok(actualizado);
                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // DESACTIVAR
    // ============================================================

    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> desactivar(
            @PathVariable Integer id) {

        return marketingRepository.findById(id)
                .map(marketing -> {

                    marketing.setEstado(false);

                    marketingRepository.save(marketing);

                    return ResponseEntity.ok(
                            "Registro de marketing desactivado correctamente."
                    );
                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // ============================================================
    // ELIMINAR DEFINITIVAMENTE
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id) {

        return marketingRepository.findById(id)
                .map(marketing -> {

                    marketingRepository.delete(marketing);

                    return ResponseEntity.ok(
                            "Registro de marketing eliminado correctamente."
                    );
                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }
}