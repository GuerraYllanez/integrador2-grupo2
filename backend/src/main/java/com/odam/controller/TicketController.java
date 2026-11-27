package com.odam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<List>> listarTickets() {
        String sql = """
                SELECT
                    t.id_ticket,
                    t.codigo,
                    t.titulo,
                    t.modulo_afectado,
                    t.descripcion,
                    t.fecha_creacion,
                    t.id_estado,
                    e.nombre_estado,
                    t.id_prioridad,
                    p.nombre_prioridad,
                    p.tiempo_sla_minutos,
                    t.id_asignado_a,
                    a.nombre_responsable,
                    a.nivel_soporte
                FROM ticket t
                JOIN estado_ticket e ON t.id_estado = e.id_estado
                JOIN prioridad p ON t.id_prioridad = p.id_prioridad
                LEFT JOIN asignado_a a ON t.id_asignado_a = a.id_asignado_a
                ORDER BY t.id_ticket DESC
                """;

        List> tickets = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(tickets);
    }

    @PostMapping
    public ResponseEntity<?> crearTicket(@RequestBody Map<String, Object> body) {
        try {
            Object rawTitulo = body.get("titulo");
            Object rawModulo = body.get("modulo_afectado") != null
                    ? body.get("modulo_afectado")
                    : body.get("moduloAfectado");
            Object rawDescripcion = body.get("descripcion");
            Object rawPrioridad = body.get("id_prioridad") != null
                    ? body.get("id_prioridad")
                    : body.get("idPrioridad");

            if (rawTitulo == null || rawTitulo.toString().isBlank()
                    || rawDescripcion == null || rawDescripcion.toString().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El título y la descripción son obligatorios."));
            }

            int idPrioridad = 2;
            if (rawPrioridad != null) {
                idPrioridad = Integer.parseInt(rawPrioridad.toString());
            }

            // Asignación automática según prioridad:
            // P1 (1) -> Nivel 3 (id 3), P2 (2) -> Nivel 2 (id 2), P3/P4 (3, 4) -> Nivel 1 (id 1)
            int idAsignadoA = switch (idPrioridad) {
                case 1 -> 3;
                case 2 -> 2;
                default -> 1;
            };

            Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ticket", Integer.class);
            int siguienteNumero = (total != null ? total : 0) + 1;
            String codigo = String.format("#INC-%03d", siguienteNumero);

            String titulo = rawTitulo.toString().trim();
            String moduloAfectado = rawModulo != null && !rawModulo.toString().isBlank()
                    ? rawModulo.toString().trim()
                    : "General";
            String descripcion = rawDescripcion.toString().trim();

            jdbcTemplate.update(
                    """
                    INSERT INTO ticket (
                        codigo, titulo, modulo_afectado, descripcion,
                        id_estado, id_prioridad, id_usuario_reporta, id_asignado_a
                    ) VALUES (?, ?, ?, ?, 1, ?, NULL, ?)
                    """,
                    codigo, titulo, moduloAfectado, descripcion, idPrioridad, idAsignadoA
            );

            String selectCreado = """
                    SELECT
                        t.id_ticket,
                        t.codigo,
                        t.titulo,
                        t.modulo_afectado,
                        t.descripcion,
                        t.fecha_creacion,
                        t.id_estado,
                        e.nombre_estado,
                        t.id_prioridad,
                        p.nombre_prioridad,
                        p.tiempo_sla_minutos,
                        t.id_asignado_a,
                        a.nombre_responsable,
                        a.nivel_soporte
                    FROM ticket t
                    JOIN estado_ticket e ON t.id_estado = e.id_estado
                    JOIN prioridad p ON t.id_prioridad = p.id_prioridad
                    LEFT JOIN asignado_a a ON t.id_asignado_a = a.id_asignado_a
                    WHERE t.codigo = ?
                    LIMIT 1
                    """;

            Map<String, Object> creado = jdbcTemplate.queryForMap(selectCreado, codigo);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear el ticket: " + ex.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> actualizarTicket(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        try {
            String selectActual = """
                    SELECT id_ticket, id_estado, id_asignado_a
                    FROM ticket
                    WHERE id_ticket = ?
                    """;
            List> encontrados = jdbcTemplate.queryForList(selectActual, id);
            if (encontrados.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket no encontrado con id: " + id));
            }

            Map<String, Object> actual = encontrados.get(0);
            int idEstado = actual.get("id_estado") != null
                    ? ((Number) actual.get("id_estado")).intValue()
                    : 1;
            Integer idAsignadoA = actual.get("id_asignado_a") != null
                    ? ((Number) actual.get("id_asignado_a")).intValue()
                    : null;

            Object rawEstado = body.get("id_estado") != null
                    ? body.get("id_estado")
                    : body.get("idEstado");
            if (rawEstado != null && !rawEstado.toString().isBlank()) {
                idEstado = Integer.parseInt(rawEstado.toString());
            }

            boolean tieneAsignado = body.containsKey("id_asignado_a") || body.containsKey("idAsignadoA");
            if (tieneAsignado) {
                Object rawAsignado = body.containsKey("id_asignado_a")
                        ? body.get("id_asignado_a")
                        : body.get("idAsignadoA");
                if (rawAsignado == null || rawAsignado.toString().isBlank()) {
                    idAsignadoA = null;
                } else {
                    idAsignadoA = Integer.parseInt(rawAsignado.toString());
                }
            }

            jdbcTemplate.update(
                    """
                    UPDATE ticket
                    SET id_estado = ?, id_asignado_a = ?
                    WHERE id_ticket = ?
                    """,
                    idEstado, idAsignadoA, id
            );

            String selectActualizado = """
                    SELECT
                        t.id_ticket,
                        t.codigo,
                        t.titulo,
                        t.modulo_afectado,
                        t.descripcion,
                        t.fecha_creacion,
                        t.id_estado,
                        e.nombre_estado,
                        t.id_prioridad,
                        p.nombre_prioridad,
                        p.tiempo_sla_minutos,
                        t.id_asignado_a,
                        a.nombre_responsable,
                        a.nivel_soporte
                    FROM ticket t
                    JOIN estado_ticket e ON t.id_estado = e.id_estado
                    JOIN prioridad p ON t.id_prioridad = p.id_prioridad
                    LEFT JOIN asignado_a a ON t.id_asignado_a = a.id_asignado_a
                    WHERE t.id_ticket = ?
                    LIMIT 1
                    """;

            Map<String, Object> actualizado = jdbcTemplate.queryForMap(selectActualizado, id);
            return ResponseEntity.ok(actualizado);
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Valores numéricos inválidos en id_estado o id_asignado_a."));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar el ticket: " + ex.getMessage()));
        }
    }
}
