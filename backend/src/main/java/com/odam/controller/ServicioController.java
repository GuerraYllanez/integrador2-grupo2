package com.odam.controller;

import com.odam.entity.Servicio;
import com.odam.repository.ServicioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "http://localhost:5173")
public class ServicioController {

private final ServicioRepository servicioRepository;

public ServicioController(ServicioRepository servicioRepository) {
    this.servicioRepository = servicioRepository;
}

// =========================================================
// LISTAR SERVICIOS
// GET /api/servicios
// Incluye activos e inactivos para conservar el historial.
// El frontend decide cuáles mostrar en el catálogo activo.
// =========================================================

@GetMapping
@PreAuthorize("hasRole('ADMINISTRADOR')")
public ResponseEntity<List<Servicio>> listar() {
    return ResponseEntity.ok(
            servicioRepository.findAllByOrderByNombreAsc()
    );
}

// =========================================================
// OBTENER SERVICIO POR ID
// GET /api/servicios/{id}
// =========================================================

@GetMapping("/{id}")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public ResponseEntity<?> obtener(@PathVariable Integer id) {

    return servicioRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "El servicio no existe."
                    )));
}

// =========================================================
// CREAR SERVICIO
// POST /api/servicios
// =========================================================

@PostMapping
@PreAuthorize("hasRole('ADMINISTRADOR')")
public ResponseEntity<?> crear(@RequestBody Servicio servicio) {

    if (servicio.getNombre() == null
            || servicio.getNombre().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "El nombre del servicio es obligatorio."
        ));
    }

    if (servicio.getPrecio() == null) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "El precio del servicio es obligatorio."
        ));
    }

    if (servicio.getPrecio().signum() <= 0) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "El precio debe ser mayor que 0."
        ));
    }

    String nombre = normalizarNombre(servicio.getNombre());

    boolean existe = servicioRepository.findAll()
            .stream()
            .anyMatch(s -> s.getNombre() != null
                    && s.getNombre().trim().equalsIgnoreCase(nombre));

    if (existe) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "message",
                "Ya existe un servicio con ese nombre, incluso si está inactivo. "
                        + "Puedes reactivarlo desde la edición."
        ));
    }

    servicio.setNombre(nombre);
    servicio.setEstado(true);

    Servicio guardado = servicioRepository.save(servicio);

    return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
}

// =========================================================
// ACTUALIZAR SERVICIO
// PUT /api/servicios/{id}
// Permite editar y reactivar un servicio inactivo.
// =========================================================

@PutMapping("/{id}")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public ResponseEntity<?> actualizar(
        @PathVariable Integer id,
        @RequestBody Servicio datos
) {

    Servicio servicio = servicioRepository.findById(id).orElse(null);

    if (servicio == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "message",
                "El servicio no existe."
        ));
    }

    if (datos.getNombre() == null
            || datos.getNombre().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "El nombre del servicio es obligatorio."
        ));
    }

    if (datos.getPrecio() == null) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "El precio del servicio es obligatorio."
        ));
    }

    if (datos.getPrecio().signum() <= 0) {
        return ResponseEntity.badRequest().body(Map.of(
                "message",
                "El precio debe ser mayor que 0."
        ));
    }

    String nombre = normalizarNombre(datos.getNombre());

    boolean existe = servicioRepository.findAll()
            .stream()
            .anyMatch(s -> !s.getIdServicio().equals(id)
                    && s.getNombre() != null
                    && s.getNombre().trim().equalsIgnoreCase(nombre));

    if (existe) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "message",
                "Ya existe otro servicio con ese nombre."
        ));
    }

    servicio.setNombre(nombre);
    servicio.setDescripcion(datos.getDescripcion());
    servicio.setPrecio(datos.getPrecio());

    if (datos.getEstado() != null) {
        servicio.setEstado(datos.getEstado());
    }

    Servicio actualizado = servicioRepository.save(servicio);

    return ResponseEntity.ok(actualizado);
}

// =========================================================
// DESACTIVAR SERVICIO
// DELETE /api/servicios/{id}
//
// Baja lógica: conserva el registro y sus relaciones históricas.
// Si ya está inactivo, responde de forma idempotente con éxito.
// =========================================================

@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public ResponseEntity<?> eliminar(@PathVariable Integer id) {

    Servicio servicio = servicioRepository.findById(id).orElse(null);

    if (servicio == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "message",
                "El servicio no existe."
        ));
    }

    if (Boolean.FALSE.equals(servicio.getEstado())) {
        return ResponseEntity.ok(Map.of(
                "message",
                "El servicio ya estaba desactivado.",
                "idServicio",
                servicio.getIdServicio(),
                "estado",
                false
        ));
    }

    servicio.setEstado(false);
    Servicio guardado = servicioRepository.save(servicio);

    return ResponseEntity.ok(Map.of(
            "message",
            "Servicio desactivado correctamente. "
                    + "Los tratamientos relacionados se conservaron.",
            "idServicio",
            guardado.getIdServicio(),
            "estado",
            false
    ));
}

// =========================================================
// NORMALIZAR NOMBRE
// =========================================================

private String normalizarNombre(String nombre) {

    String texto = nombre.trim();

    if (texto.isEmpty()) {
        return texto;
    }

    return texto.substring(0, 1).toUpperCase()
            + texto.substring(1);
}
}
