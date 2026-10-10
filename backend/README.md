# ODAM Backend

Spring Boot 3 + Java 17 + Spring Security + JJWT + BCrypt + Spring Data JPA + MySQL.

## Seguridad
- STATELESS sessions.
- JWT con claims correo, rol, issuedAt y expiration.
- JJWT `verifyWith(key)` + `parseSignedClaims()`.
- BCryptPasswordEncoder.
- `JwtAuthenticationFilter` antes de UsernamePasswordAuthenticationFilter.
- `/api/admin/**` protegido con ROLE_ADMINISTRADOR.
- Bean Validation en DTOs.

## Arranque
`mvn spring-boot:run`
