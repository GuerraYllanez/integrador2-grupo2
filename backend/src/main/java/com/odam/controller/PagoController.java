package com.odam.controller;

import com.odam.dto.PagoRequest;
import com.odam.entity.Cita;
import com.odam.entity.Paciente;
import com.odam.entity.Pago;
import com.odam.entity.Pago.EstadoPago;
import com.odam.entity.Servicio;
import com.odam.repository.CitaRepository;
import com.odam.repository.PacienteRepository;
import com.odam.repository.PagoRepository;
import com.odam.repository.ServicioRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class PagoController {

    private final PagoRepository pagoRepository;
    private final PacienteRepository pacienteRepository;
    private final CitaRepository citaRepository;
    private final ServicioRepository servicioRepository;

    public PagoController(
            PagoRepository pagoRepository,
            PacienteRepository pacienteRepository,
            CitaRepository citaRepository,
            ServicioRepository servicioRepository) {

        this.pagoRepository = pagoRepository;
        this.pacienteRepository = pacienteRepository;
        this.citaRepository = citaRepository;
        this.servicioRepository = servicioRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PagoResponse> listar() {

        return pagoRepository.findAll()
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public PagoResponse obtener(
            @PathVariable Integer id) {

        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pago no encontrado"
                        ));

        return convertirRespuesta(pago);
    }

    @PostMapping
    @Transactional
    public PagoResponse crear(
            @Valid @RequestBody PagoRequest request) {

        Paciente paciente = pacienteRepository.findById(
                request.idPaciente()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));

        Servicio servicio = servicioRepository.findById(
                request.idServicio()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));

        Cita cita = null;

        if (request.idCita() != null) {
            cita = citaRepository.findById(
                    request.idCita()
            ).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Cita no encontrada"
                    ));
        }

        Pago pago = new Pago();

        pago.setPaciente(paciente);
        pago.setCita(cita);
        pago.setServicio(servicio);
        pago.setMonto(request.monto());
        pago.setMetodoPago(request.metodoPago());
        pago.setEstado(
                request.estado() != null
                        ? request.estado()
                        : EstadoPago.PENDIENTE
        );
        pago.setReferencia(request.referencia());
        pago.setObservaciones(request.observaciones());

        Pago pagoGuardado = pagoRepository.save(pago);

        return convertirRespuesta(pagoGuardado);
    }

    @PutMapping("/{id}")
    @Transactional
    public PagoResponse actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PagoRequest request) {

        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pago no encontrado"
                        ));

        Paciente paciente = pacienteRepository.findById(
                request.idPaciente()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Paciente no encontrado"
                ));

        Servicio servicio = servicioRepository.findById(
                request.idServicio()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));

        Cita cita = null;

        if (request.idCita() != null) {
            cita = citaRepository.findById(
                    request.idCita()
            ).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Cita no encontrada"
                    ));
        }

        pago.setPaciente(paciente);
        pago.setCita(cita);
        pago.setServicio(servicio);
        pago.setMonto(request.monto());
        pago.setMetodoPago(request.metodoPago());

        if (request.estado() != null) {
            pago.setEstado(request.estado());
        }

        pago.setReferencia(request.referencia());
        pago.setObservaciones(request.observaciones());

        Pago pagoActualizado = pagoRepository.save(pago);

        return convertirRespuesta(pagoActualizado);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void eliminar(
            @PathVariable Integer id) {

        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pago no encontrado"
                        ));

        pagoRepository.delete(pago);
        pagoRepository.flush();
    }

    private PagoResponse convertirRespuesta(Pago pago) {

        Paciente paciente = pago.getPaciente();
        Cita cita = pago.getCita();
        Servicio servicio = pago.getServicio();

        String pacienteNombre = "";

        if (paciente != null) {
            pacienteNombre =
                    paciente.getNombres() + " " +
                    paciente.getApellidos();
        }

        String servicioNombre = "";

        if (servicio != null) {
            servicioNombre = servicio.getNombre();
        }

        Integer idCita = null;

        if (cita != null) {
            idCita = cita.getIdCita();
        }

        return new PagoResponse(
                pago.getIdPago(),
                paciente != null
                        ? paciente.getIdPaciente()
                        : null,
                pacienteNombre,
                paciente != null
                        ? paciente.getDocumento()
                        : null,
                idCita,
                servicio != null
                        ? servicio.getIdServicio()
                        : null,
                servicioNombre,
                servicio != null
                        ? servicio.getPrecio()
                        : null,
                pago.getMonto(),
                pago.getMetodoPago(),
                pago.getEstado(),
                pago.getFechaPago(),
                pago.getReferencia(),
                pago.getObservaciones()
        );
    }

    public record PagoResponse(
            Integer idPago,
            Integer idPaciente,
            String paciente,
            String documentoPaciente,
            Integer idCita,
            Integer idServicio,
            String servicio,
            BigDecimal precioServicio,
            BigDecimal monto,
            Pago.MetodoPago metodoPago,
            EstadoPago estado,
            LocalDateTime fechaPago,
            String referencia,
            String observaciones
    ) {
    }
}