package com.odam.repository; import com.odam.entity.Paciente; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface PacienteRepository extends JpaRepository<Paciente,Integer>{ Optional<Paciente> findByDocumento(String documento); boolean existsByDocumento(String documento); }
