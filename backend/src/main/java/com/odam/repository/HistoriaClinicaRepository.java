package com.odam.repository;

import com.odam.entity.HistoriaClinica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HistoriaClinicaRepository
        extends JpaRepository<HistoriaClinica, Integer> {

    Optional<HistoriaClinica> findByPacienteIdPaciente(
            Integer idPaciente
    );

    boolean existsByPacienteIdPaciente(
            Integer idPaciente
    );

    boolean existsByCodigoHistoria(
            String codigoHistoria
    );
}