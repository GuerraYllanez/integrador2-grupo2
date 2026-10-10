
package com.odam.repository;

import com.odam.entity.UrgenciaDuplicidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UrgenciaDuplicidadRepository
        extends JpaRepository<UrgenciaDuplicidad, Integer> {

    boolean existsByUrgenciaOriginal_IdUrgenciaAndUrgenciaDuplicada_IdUrgencia(
            Integer idUrgenciaOriginal,
            Integer idUrgenciaDuplicada
    );

    boolean existsByUrgenciaOriginal_IdUrgencia(
            Integer idUrgenciaOriginal
    );

    boolean existsByUrgenciaDuplicada_IdUrgencia(
            Integer idUrgenciaDuplicada
    );

    List<UrgenciaDuplicidad> findAllByOrderByFechaRevisionDesc();
}