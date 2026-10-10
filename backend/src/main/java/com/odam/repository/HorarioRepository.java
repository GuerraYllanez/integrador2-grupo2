package com.odam.repository;

import com.odam.entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface HorarioRepository
        extends JpaRepository<Horario, Integer> {

    @Query("""
        SELECT h
        FROM Horario h
        JOIN FETCH h.odontologo
        ORDER BY h.fecha ASC, h.horaInicio ASC
        """)
    List<Horario> findAllConOdontologo();

    @Query("""
        SELECT h
        FROM Horario h
        JOIN FETCH h.odontologo
        WHERE h.idHorario = :id
        """)
    Optional<Horario> findByIdConOdontologo(Integer id);
}