
package com.odam.controller;

import com.odam.dto.MarketingRequest;
import com.odam.entity.CampanaMarketing;
import com.odam.repository.CampanaMarketingRepository;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing")
@CrossOrigin(origins = "http://localhost:5173")
public class MarketingController {

    private final CampanaMarketingRepository campanaRepository;

    public MarketingController(
            CampanaMarketingRepository campanaRepository) {
        this.campanaRepository = campanaRepository;
    }

    // LISTAR CAMPAÑAS
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<CampanaMarketing>> listar() {
        return ResponseEntity.ok(campanaRepository.findAll());
    }

    // OBTENER CAMPAÑA POR ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CampanaMarketing> obtener(
            @PathVariable Integer id) {

        return campanaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREAR CAMPAÑA
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CampanaMarketing> crear(
            @Valid @RequestBody MarketingRequest request) {

        CampanaMarketing campana = new CampanaMarketing();

        campana.setNombreCampana(request.getNombreCampana().trim());
        campana.setDescripcion(request.getDescripcion());
        campana.setFechaInicio(request.getFechaInicio());
        campana.setFechaFin(request.getFechaFin());
        campana.setEstado(
                request.getEstado() == null ? true : request.getEstado()
        );

        return ResponseEntity.ok(campanaRepository.save(campana));
    }

    // ACTUALIZAR CAMPAÑA
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CampanaMarketing> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody MarketingRequest request) {

        return campanaRepository.findById(id)
                .map(campana -> {
                    campana.setNombreCampana(
                            request.getNombreCampana().trim()
                    );
                    campana.setDescripcion(request.getDescripcion());
                    campana.setFechaInicio(request.getFechaInicio());
                    campana.setFechaFin(request.getFechaFin());

                    if (request.getEstado() != null) {
                        campana.setEstado(request.getEstado());
                    }

                    return ResponseEntity.ok(
                            campanaRepository.save(campana)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DESACTIVAR CAMPAÑA
    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> desactivar(@PathVariable Integer id) {

        return campanaRepository.findById(id)
                .map(campana -> {
                    campana.setEstado(false);
                    campanaRepository.save(campana);

                    return ResponseEntity.ok(
                            "Campaña desactivada correctamente."
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ELIMINAR CAMPAÑA
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {

        return campanaRepository.findById(id)
                .map(campana -> {
                    campanaRepository.delete(campana);

                    return ResponseEntity.ok(
                            "Campaña eliminada correctamente."
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }
}