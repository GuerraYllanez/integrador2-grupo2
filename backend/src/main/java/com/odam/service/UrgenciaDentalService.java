package com.odam.service;

import com.odam.entity.UrgenciaDental;
import com.odam.repository.UrgenciaDentalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class UrgenciaDentalService {

    private final UrgenciaDentalRepository urgenciaRepository;

    public UrgenciaDentalService(
            UrgenciaDentalRepository urgenciaRepository) {
        this.urgenciaRepository = urgenciaRepository;
    }

    /**
     * Lista todas las urgencias dentales.
     */
    @Transactional(readOnly = true)
    public List<UrgenciaDental> listarTodas() {
        return urgenciaRepository.findAll();
    }

    /**
     * Lista las urgencias por estado.
     */
    @Transactional(readOnly = true)
    public List<UrgenciaDental> listarPorEstado(String estado) {
        validarEstado(estado);
        return urgenciaRepository.findByEstado(estado);
    }

    /**
     * Busca una urgencia por su identificador.
     */
    @Transactional(readOnly = true)
    public UrgenciaDental buscarPorId(Integer id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID de la urgencia no es válido."
            );
        }

        return urgenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la urgencia dental con ID " + id
                ));
    }

    /**
     * Registra una urgencia dental.
     */
    public UrgenciaDental crear(UrgenciaDental urgencia) {
        validarUrgencia(urgencia);

        if (urgencia.getIdUrgencia() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Para registrar una urgencia nueva, no envíes un ID."
            );
        }

        if (urgencia.getEstado() == null
                || urgencia.getEstado().isBlank()) {
            urgencia.setEstado("ACTIVA");
        } else {
            validarEstado(urgencia.getEstado());
        }

        return urgenciaRepository.save(urgencia);
    }

    /**
     * Actualiza una urgencia existente.
     */
    public UrgenciaDental actualizar(
            Integer id,
            UrgenciaDental datos) {

        UrgenciaDental existente = buscarPorId(id);
        validarUrgencia(datos);

        existente.setPaciente(datos.getPaciente());
        existente.setHistoriaClinica(datos.getHistoriaClinica());
        existente.setTipoUrgencia(datos.getTipoUrgencia().trim());
        existente.setDescripcion(datos.getDescripcion().trim());

        if (datos.getEstado() != null
                && !datos.getEstado().isBlank()) {
            validarEstado(datos.getEstado());
            existente.setEstado(datos.getEstado().trim().toUpperCase());
        }

        return urgenciaRepository.save(existente);
    }

    /**
     * Actualiza únicamente el estado de una urgencia.
     */
    public UrgenciaDental actualizarEstado(
            Integer id,
            String estado) {

        UrgenciaDental urgencia = buscarPorId(id);
        validarEstado(estado);

        urgencia.setEstado(estado.trim().toUpperCase());

        return urgenciaRepository.save(urgencia);
    }

    /**
     * Elimina una urgencia específica.
     * No elimina ni fusiona otras urgencias.
     */
    public void eliminar(Integer id) {
        UrgenciaDental urgencia = buscarPorId(id);
        urgenciaRepository.delete(urgencia);
    }

    /**
     * Comprueba que los datos obligatorios estén presentes.
     */
    private void validarUrgencia(UrgenciaDental urgencia) {
        if (urgencia == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos de la urgencia son obligatorios."
            );
        }

        if (urgencia.getPaciente() == null
                || urgencia.getPaciente().getIdPaciente() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes indicar un paciente válido."
            );
        }

        if (urgencia.getHistoriaClinica() == null
                || urgencia.getHistoriaClinica().getIdHistoria() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes indicar una historia clínica válida."
            );
        }

        if (urgencia.getTipoUrgencia() == null
                || urgencia.getTipoUrgencia().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El tipo de urgencia es obligatorio."
            );
        }

        if (urgencia.getTipoUrgencia().trim().length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El tipo de urgencia no puede superar los 100 caracteres."
            );
        }

        if (urgencia.getDescripcion() == null
                || urgencia.getDescripcion().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La descripción de la urgencia es obligatoria."
            );
        }
    }

    /**
     * Solo permite los estados definidos en la base de datos.
     */
    private void validarEstado(String estado) {
        if (estado == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado de la urgencia es obligatorio."
            );
        }

        String estadoNormalizado = estado.trim().toUpperCase();

        if (!estadoNormalizado.equals("ACTIVA")
                && !estadoNormalizado.equals("EN_ATENCION")
                && !estadoNormalizado.equals("RESUELTA")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Estado inválido. Usa ACTIVA, EN_ATENCION o RESUELTA."
            );
        }
    }
}