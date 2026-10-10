
package com.odam.repository;

import com.odam.entity.UrgenciaDental;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UrgenciaDentalRepository
        extends JpaRepository<UrgenciaDental, Integer> {

    // Consulta todos los registros, incluidos los eliminados.
    // Se conserva para no alterar posibles usos internos existentes.
    @EntityGraph(attributePaths = {
        "paciente",
        "historiaClinica"
    })
    @Override
    List<UrgenciaDental> findAll();

    // Lista únicamente las urgencias que no fueron eliminadas.
    @EntityGraph(attributePaths = {
        "paciente",
        "historiaClinica"
    })
    List<UrgenciaDental> findByEliminadaFalse();

    // Lista urgencias por estado, excluyendo las eliminadas.
    @EntityGraph(attributePaths = {
        "paciente",
        "historiaClinica"
    })
    List<UrgenciaDental> findByEstadoAndEliminadaFalse(String estado);

    // Se conserva para otros usos del sistema.
    @EntityGraph(attributePaths = {
        "paciente",
        "historiaClinica"
    })
    List<UrgenciaDental> findByEstado(String estado);

    // Busca por ID, incluidos los registros eliminados,
    // para permitir consultar su existencia antes de operar.
    @EntityGraph(attributePaths = {
        "paciente",
        "historiaClinica"
    })
    @Override
    Optional<UrgenciaDental> findById(Integer id);
}