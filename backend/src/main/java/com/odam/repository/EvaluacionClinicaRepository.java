package com.odam.repository;

import com.odam.entity.EvaluacionClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EvaluacionClinicaRepository
        extends JpaRepository<EvaluacionClinica, Integer> {

    @Query("""
        SELECT e
        FROM EvaluacionClinica e
        JOIN FETCH e.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH e.odontologo o
        """)
    List<EvaluacionClinica> findAllWithRelations();

    @Query("""
        SELECT e
        FROM EvaluacionClinica e
        JOIN FETCH e.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH e.odontologo o
        WHERE e.idEvaluacion = :id
        """)
    Optional<EvaluacionClinica> findByIdWithRelations(Integer id);

    @Query("""
        SELECT e
        FROM EvaluacionClinica e
        JOIN FETCH e.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH e.odontologo o
        WHERE h.idHistoria = :idHistoria
        """)
    List<EvaluacionClinica> findByHistoriaIdHistoriaWithRelations(
            Integer idHistoria
    );

    @Query("""
        SELECT e
        FROM EvaluacionClinica e
        JOIN FETCH e.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH e.odontologo o
        WHERE o.idOdontologo = :idOdontologo
        """)
    List<EvaluacionClinica> findByOdontologoIdOdontologoWithRelations(
            Integer idOdontologo
    );
}