package com.odam.controller;

import com.odam.entity.Odontologo;
import com.odam.repository.OdontologoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/odontologos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@CrossOrigin(origins = "http://localhost:5173")
public class OdontologoController {

    private final OdontologoRepository odontologoRepository;

    public OdontologoController(
            OdontologoRepository odontologoRepository
    ) {
        this.odontologoRepository = odontologoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Odontologo>> listar() {
        return ResponseEntity.ok(
                odontologoRepository.findAll()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(
            @PathVariable Integer id
    ) {
        Odontologo odontologo =
                odontologoRepository.findById(id).orElse(null);

        if (odontologo == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Odontólogo no encontrado"
                    ));
        }

        return ResponseEntity.ok(odontologo);
    }

    @PostMapping
    public ResponseEntity<?> crear(
            @RequestBody Odontologo datos
    ) {

        if (datos.getNombres() == null ||
                datos.getNombres().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Los nombres son obligatorios"
                    ));
        }

        if (datos.getApellidos() == null ||
                datos.getApellidos().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Los apellidos son obligatorios"
                    ));
        }

        if (datos.getColegiatura() == null ||
                datos.getColegiatura().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "La colegiatura es obligatoria"
                    ));
        }

        String colegiatura =
                datos.getColegiatura().trim();

        boolean existeColegiatura =
                odontologoRepository.findAll()
                        .stream()
                        .anyMatch(odontologo ->
                                odontologo.getColegiatura() != null &&
                                odontologo.getColegiatura()
                                        .trim()
                                        .equalsIgnoreCase(colegiatura)
                        );

        if (existeColegiatura) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Ya existe un odontólogo con esa colegiatura"
                    ));
        }

        datos.setNombres(
                datos.getNombres().trim()
        );

        datos.setApellidos(
                datos.getApellidos().trim()
        );

        datos.setEspecialidad(
                datos.getEspecialidad() == null
                        ? null
                        : datos.getEspecialidad().trim()
        );

        datos.setColegiatura(colegiatura);

        datos.setTelefono(
                datos.getTelefono() == null
                        ? null
                        : datos.getTelefono().trim()
        );

        datos.setCorreo(
                datos.getCorreo() == null
                        ? null
                        : datos.getCorreo().trim()
        );

        if (datos.getEstado() == null) {
            datos.setEstado(true);
        }

        Odontologo guardado =
                odontologoRepository.save(datos);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @RequestBody Odontologo datos
    ) {

        Odontologo odontologo =
                odontologoRepository.findById(id).orElse(null);

        if (odontologo == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Odontólogo no encontrado"
                    ));
        }

        if (datos.getNombres() == null ||
                datos.getNombres().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Los nombres son obligatorios"
                    ));
        }

        if (datos.getApellidos() == null ||
                datos.getApellidos().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Los apellidos son obligatorios"
                    ));
        }

        if (datos.getColegiatura() == null ||
                datos.getColegiatura().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "La colegiatura es obligatoria"
                    ));
        }

        String colegiatura =
                datos.getColegiatura().trim();

        boolean existeColegiatura =
                odontologoRepository.findAll()
                        .stream()
                        .anyMatch(item ->
                                !item.getIdOdontologo()
                                        .equals(id)
                                &&
                                item.getColegiatura() != null
                                &&
                                item.getColegiatura()
                                        .trim()
                                        .equalsIgnoreCase(
                                                colegiatura
                                        )
                        );

        if (existeColegiatura) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Ya existe otro odontólogo con esa colegiatura"
                    ));
        }

        odontologo.setNombres(
                datos.getNombres().trim()
        );

        odontologo.setApellidos(
                datos.getApellidos().trim()
        );

        odontologo.setEspecialidad(
                datos.getEspecialidad() == null
                        ? null
                        : datos.getEspecialidad().trim()
        );

        odontologo.setColegiatura(colegiatura);

        odontologo.setTelefono(
                datos.getTelefono() == null
                        ? null
                        : datos.getTelefono().trim()
        );

        odontologo.setCorreo(
                datos.getCorreo() == null
                        ? null
                        : datos.getCorreo().trim()
        );

        if (datos.getEstado() != null) {
            odontologo.setEstado(
                    datos.getEstado()
            );
        }

        Odontologo actualizado =
                odontologoRepository.save(odontologo);

        return ResponseEntity.ok(actualizado);
    }

    /*
     * Eliminación lógica.
     *
     * No se elimina físicamente el registro porque
     * puede estar relacionado con citas, historias,
     * tratamientos u otros registros.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Integer id
    ) {

        Odontologo odontologo =
                odontologoRepository.findById(id).orElse(null);

        if (odontologo == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Odontólogo no encontrado"
                    ));
        }

        odontologo.setEstado(false);

        odontologoRepository.save(odontologo);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Odontólogo desactivado correctamente"
                )
        );
    }
}