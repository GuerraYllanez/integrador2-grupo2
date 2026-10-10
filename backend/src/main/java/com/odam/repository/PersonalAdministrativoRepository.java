package com.odam.repository;

import com.odam.entity.PersonalAdministrativo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalAdministrativoRepository
        extends JpaRepository<PersonalAdministrativo, Integer> {
}