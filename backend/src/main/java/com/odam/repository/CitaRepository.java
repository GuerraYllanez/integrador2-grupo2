package com.odam.repository;

import com.odam.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;

public interface CitaRepository
        extends JpaRepository<Cita, Integer> {

    @Query("""
        SELECT CASE
            WHEN COUNT(c) > 0 THEN true
            ELSE false
        END
        FROM Cita c
        WHERE c.odontologo.idOdontologo = :idOdontologo
          AND c.fechaCita = :fechaCita
          AND c.horaCita = :horaCita
          AND c.idCita <> :idCita
    """)
    boolean existsByIdOdontologoIdOdontologoAndFechaCitaAndHoraCitaAndIdCitaNot(
            @Param("idOdontologo") Integer idOdontologo,
            @Param("fechaCita") LocalDate fechaCita,
            @Param("horaCita") LocalTime horaCita,
            @Param("idCita") Integer idCita
    );

    boolean existsByPaciente_IdPaciente(Integer idPaciente);
}