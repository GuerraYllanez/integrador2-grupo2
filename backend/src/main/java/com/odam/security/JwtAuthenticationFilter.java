package com.odam.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserDetailsService users;

    public JwtAuthenticationFilter(
            JwtService jwt,
            UserDetailsService users
    ) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain
    ) throws ServletException, IOException {

        String authorizationHeader = req.getHeader("Authorization");

        // Verificar que exista el encabezado Bearer
        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            try {

                // Extraer el JWT
                String token = authorizationHeader.substring(7);

                // Obtener el correo desde el JWT
                String correo = jwt.correo(token);

                // Verificar que todavía no exista una autenticación
                if (SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

                    // Buscar el usuario en la base de datos
                    UserDetails userDetails =
                            users.loadUserByUsername(correo);

                    // Verificar que el usuario esté habilitado
                    if (userDetails.isEnabled()) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(req)
                        );

                        // Registrar la autenticación en Spring Security
                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(authentication);
                    }
                }

            } catch (Exception e) {

                // Si el JWT es inválido, expiró o no puede validarse,
                // simplemente continúa sin autenticar al usuario.
                SecurityContextHolder
                        .clearContext();
            }
        }

        // Continuar con la petición
        chain.doFilter(req, res);
    }
}