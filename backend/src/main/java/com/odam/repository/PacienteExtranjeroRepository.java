package com.odam.repository;

import com.odam.entity.PacienteExtranjero;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacienteExtranjeroRepository
        extends JpaRepository<PacienteExtranjero, Integer> {

    Optional<PacienteExtranjero> findByPaciente_IdPaciente(
        Integer idPaciente
    );

    boolean existsByPaciente_IdPaciente(
        Integer idPaciente
    );

    boolean existsByNumeroDocumento(
        String numeroDocumento
    );
}