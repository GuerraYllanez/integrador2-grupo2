package com.odam.repository;

import com.odam.entity.Reprogramacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReprogramacionRepository
        extends JpaRepository<Reprogramacion, Integer> {
}