
package com.odam.service;

import com.odam.entity.UrgenciaDental;
import com.odam.entity.UrgenciaDuplicidad;
import com.odam.repository.UrgenciaDentalRepository;
import com.odam.repository.UrgenciaDuplicidadRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UrgenciaDuplicidadService {

    private final UrgenciaDentalRepository urgenciaRepository;
    private final UrgenciaDuplicidadRepository duplicidadRepository;

    public UrgenciaDuplicidadService(
            UrgenciaDentalRepository urgenciaRepository,
            UrgenciaDuplicidadRepository duplicidadRepository) {
        this.urgenciaRepository = urgenciaRepository;
        this.duplicidadRepository = duplicidadRepository;
    }

    @Transactional
    public UrgenciaDuplicidad registrarRevision(
            Integer originalId,
            Integer duplicadaId) {

        if (originalId == null || duplicadaId == null
                || originalId <= 0 || duplicadaId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los IDs de las urgencias deben ser válidos."
            );
        }

        if (originalId.equals(duplicadaId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No puedes revisar una urgencia contra sí misma."
            );
        }

        UrgenciaDental original = urgenciaRepository.findById(originalId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe la urgencia original."
                ));

        UrgenciaDental duplicada = urgenciaRepository.findById(duplicadaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe la urgencia que se quiere revisar."
                ));

        Integer pacienteOriginal =
                original.getPaciente().getIdPaciente();

        Integer pacienteDuplicada =
                duplicada.getPaciente().getIdPaciente();

        Integer historiaOriginal =
                original.getHistoriaClinica().getIdHistoria();

        Integer historiaDuplicada =
                duplicada.getHistoriaClinica().getIdHistoria();

        if (!pacienteOriginal.equals(pacienteDuplicada)
                || !historiaOriginal.equals(historiaDuplicada)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las urgencias deben pertenecer al mismo paciente "
                    + "y a la misma historia clínica."
            );
        }

        boolean yaRegistrada =
                duplicidadRepository
                        .existsByUrgenciaOriginal_IdUrgenciaAndUrgenciaDuplicada_IdUrgencia(
                                originalId, duplicadaId)
                || duplicidadRepository
                        .existsByUrgenciaOriginal_IdUrgenciaAndUrgenciaDuplicada_IdUrgencia(
                                duplicadaId, originalId);

        if (yaRegistrada) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta pareja de urgencias ya fue revisada."
            );
        }

        UrgenciaDuplicidad revision = new UrgenciaDuplicidad();
        revision.setUrgenciaOriginal(original);
        revision.setUrgenciaDuplicada(duplicada);
        revision.setEstadoRevision("CONFIRMADO_DUPLICADO");

        return duplicidadRepository.save(revision);
    }
}