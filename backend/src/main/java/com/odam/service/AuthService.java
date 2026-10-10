package com.odam.service;

import com.odam.dto.LoginRequest;
import com.odam.dto.LoginResponse;
import com.odam.dto.RegistroUsuarioRequest;
import com.odam.entity.Auditoria;
import com.odam.entity.Rol;
import com.odam.entity.Usuario;
import com.odam.repository.AuditoriaRepository;
import com.odam.repository.RolRepository;
import com.odam.repository.UsuarioRepository;
import com.odam.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

        private final UsuarioRepository users;
        private final RolRepository roles;
        private final AuditoriaRepository auditoriaRepository;
        private final PasswordEncoder encoder;
        private final AuthenticationManager auth;
        private final JwtService jwt;

        public AuthService(
                        UsuarioRepository users,
                        RolRepository roles,
                        AuditoriaRepository auditoriaRepository,
                        PasswordEncoder encoder,
                        AuthenticationManager auth,
                        JwtService jwt) {

                this.users = users;
                this.roles = roles;
                this.auditoriaRepository = auditoriaRepository;
                this.encoder = encoder;
                this.auth = auth;
                this.jwt = jwt;
        }

        @Transactional
        public LoginResponse login(LoginRequest req) {

                // 1. Validar las credenciales del usuario.
                auth.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                req.correo(),
                                                req.contrasena()));

                // 2. Obtener el usuario autenticado.
                Usuario u = users.findByCorreo(req.correo())
                                .orElseThrow();

                // 3. Registrar el inicio de sesión exitoso.
                Auditoria registro = new Auditoria();
                registro.setUsuario(u);
                registro.setAccion("LOGIN");
                registro.setTablaAfectada("usuarios");
                registro.setIdRegistro(u.getIdUsuario());
                registro.setDescripcion(
                                "Inicio de sesión exitoso del usuario "
                                                + u.getCorreo());

                auditoriaRepository.save(registro);

                // 4. Generar el JWT y devolver la respuesta habitual.
                return new LoginResponse(
                                jwt.generate(
                                                u.getCorreo(),
                                                u.getRol().getNombreRol()),
                                "Bearer",
                                u.getCorreo(),
                                u.getRol().getNombreRol(),
                                u.getNombreUsuario());
        }

        @Transactional
        public void registrar(RegistroUsuarioRequest req) {

                if (users.existsByCorreo(req.correo())) {
                        throw new IllegalArgumentException(
                                        "El correo ya está registrado");
                }

                Rol paciente = roles.findByNombreRol("PACIENTE")
                                .orElseThrow();

                Usuario u = new Usuario();
                u.setNombreUsuario(req.nombreUsuario());
                u.setCorreo(req.correo());
                u.setContrasena(
                                encoder.encode(req.contrasena()));
                u.setRol(paciente);
                u.setEstado(true);

                Usuario usuarioGuardado = users.save(u);

                // Registrar la creación del usuario.
                Auditoria registro = new Auditoria();
                registro.setUsuario(usuarioGuardado);
                registro.setAccion("REGISTRO_USUARIO");
                registro.setTablaAfectada("usuarios");
                registro.setIdRegistro(usuarioGuardado.getIdUsuario());
                registro.setDescripcion(
                                "Se registró un nuevo usuario: "
                                                + usuarioGuardado.getCorreo()
                                                + " con rol "
                                                + usuarioGuardado.getRol().getNombreRol());

                auditoriaRepository.save(registro);

        }
}