package com.odam.config;

import com.odam.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwt;

    public SecurityConfig(JwtAuthenticationFilter jwt) {
        this.jwt = jwt;
    }

    // BCrypt para almacenar y verificar contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configuración principal de Spring Security
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {

        http
            // JWT no necesita protección CSRF
            .csrf(csrf -> csrf.disable())

            // Configuración CORS para el frontend
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )

            // La aplicación utiliza JWT, no sesiones
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Reglas de autorización
            .authorizeHttpRequests(auth -> auth

                // Login, registro y health son públicos
                .requestMatchers(
                    "/api/auth/**",
                    "/api/health"
                ).permitAll()

                // Solo ADMINISTRADOR
                .requestMatchers("/api/admin/**")
                .hasRole("ADMINISTRADOR")

                // El resto de /api requiere autenticación
                .requestMatchers("/api/**")
                .authenticated()

                // Páginas del frontend
                .anyRequest()
                .permitAll()
            )

            // Filtro JWT antes del filtro de autenticación estándar
            .addFilterBefore(
                jwt,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // Configuración CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        config.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            )
        );

        config.setAllowedHeaders(
            List.of("*")
        );

        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            config
        );

        return source;
    }
}