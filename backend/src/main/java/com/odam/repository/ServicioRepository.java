package com.odam.repository;

import com.odam.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioRepository
        extends JpaRepository<Servicio, Integer> {

    List<Servicio> findAllByOrderByNombreAsc();
}