package com.odam.repository;

import com.odam.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Integer> {

    boolean existsByPaciente_IdPaciente(Integer idPaciente);
}