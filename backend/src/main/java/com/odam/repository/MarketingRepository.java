package com.odam.repository;

import com.odam.entity.Marketing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketingRepository
        extends JpaRepository<Marketing, Integer> {
}