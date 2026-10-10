package com.odam.security;

import com.odam.entity.Usuario;
import com.odam.repository.UsuarioRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;

    public CustomUserDetailsService(UsuarioRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        Usuario u = repo.findByCorreo(correo)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuario no encontrado: " + correo
                        )
                );

        return User.builder()
                .username(u.getCorreo())
                .password(u.getContrasena())
                .authorities(
                        "ROLE_" + u.getRol().getNombreRol()
                )
                .disabled(!Boolean.TRUE.equals(u.getEstado()))
                .build();
    }
}

