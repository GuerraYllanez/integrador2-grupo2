package com.odam.repository;

import com.odam.entity.Tratamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TratamientoRepository
        extends JpaRepository<Tratamiento, Integer> {

    @Query("""
        SELECT t
        FROM Tratamiento t
        JOIN FETCH t.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH t.odontologo o
        JOIN FETCH t.servicio s
        """)
    List<Tratamiento> findAllWithRelations();

    @Query("""
        SELECT t
        FROM Tratamiento t
        JOIN FETCH t.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH t.odontologo o
        JOIN FETCH t.servicio s
        WHERE t.idTratamiento = :id
        """)
    Optional<Tratamiento> findByIdWithRelations(Integer id);

    @Query("""
        SELECT t
        FROM Tratamiento t
        JOIN FETCH t.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH t.odontologo o
        JOIN FETCH t.servicio s
        WHERE h.idHistoria = :idHistoria
        """)
    List<Tratamiento> findByHistoriaIdHistoriaWithRelations(
            Integer idHistoria
    );

    @Query("""
        SELECT t
        FROM Tratamiento t
        JOIN FETCH t.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH t.odontologo o
        JOIN FETCH t.servicio s
        WHERE o.idOdontologo = :idOdontologo
        """)
    List<Tratamiento> findByOdontologoIdOdontologoWithRelations(
            Integer idOdontologo
    );

    @Query("""
        SELECT t
        FROM Tratamiento t
        JOIN FETCH t.historia h
        JOIN FETCH h.paciente p
        JOIN FETCH t.odontologo o
        JOIN FETCH t.servicio s
        WHERE t.estado = :estado
        """)
    List<Tratamiento> findByEstadoWithRelations(
            com.odam.entity.EstadoTratamiento estado
    );
}