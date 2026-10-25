
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

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository users;

    @Mock
    private RolRepository roles;

    @Mock
    private AuditoriaRepository auditoriaRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private AuthenticationManager auth;

    @Mock
    private JwtService jwt;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginCorrectoDebeGenerarRespuestaYRegistrarAuditoria() {
        LoginRequest request = new LoginRequest(
                "prueba@example.test",
                "ClaveFicticia123"
        );

        Rol rol = new Rol();
        rol.setNombreRol("PACIENTE");

        Usuario usuario = new Usuario();
        usuario.setCorreo("prueba@example.test");
        usuario.setNombreUsuario("Usuario Prueba");
        usuario.setRol(rol);

        when(users.findByCorreo("prueba@example.test"))
                .thenReturn(Optional.of(usuario));

        when(jwt.generate("prueba@example.test", "PACIENTE"))
                .thenReturn("TOKEN_FICTICIO");

        LoginResponse respuesta = authService.login(request);

        assertNotNull(respuesta);
        assertEquals("TOKEN_FICTICIO", respuesta.token());
        assertEquals("Bearer", respuesta.tipo());
        assertEquals("prueba@example.test", respuesta.correo());
        assertEquals("PACIENTE", respuesta.rol());
        assertEquals("Usuario Prueba", respuesta.nombreUsuario());

        verify(auth).authenticate(any(
                UsernamePasswordAuthenticationToken.class
        ));

        ArgumentCaptor<Auditoria> captor =
                ArgumentCaptor.forClass(Auditoria.class);

        verify(auditoriaRepository).save(captor.capture());

        assertEquals("LOGIN", captor.getValue().getAccion());
        assertEquals(
                "usuarios",
                captor.getValue().getTablaAfectada()
        );
    }

    @Test
    void registrarUsuarioNuevoDebeGuardarContrasenaCodificada() {
        RegistroUsuarioRequest request = new RegistroUsuarioRequest(
                "Usuario Prueba",
                "nuevo@example.test",
                "ClaveFicticia123"
        );

        Rol rolPaciente = new Rol();
        rolPaciente.setNombreRol("PACIENTE");

        when(users.existsByCorreo("nuevo@example.test"))
                .thenReturn(false);

        when(roles.findByNombreRol("PACIENTE"))
                .thenReturn(Optional.of(rolPaciente));

        // Valor ficticio: no es un hash criptográfico real.
        when(encoder.encode("ClaveFicticia123"))
                .thenReturn("HASH_FICTICIO");

        when(users.save(any(Usuario.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        authService.registrar(request);

        ArgumentCaptor<Usuario> usuarioCaptor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(users).save(usuarioCaptor.capture());

        Usuario guardado = usuarioCaptor.getValue();

        assertEquals("Usuario Prueba", guardado.getNombreUsuario());
        assertEquals("nuevo@example.test", guardado.getCorreo());
        assertEquals("HASH_FICTICIO", guardado.getContrasena());
        assertNotEquals(
                "ClaveFicticia123",
                guardado.getContrasena()
        );
        assertEquals("PACIENTE", guardado.getRol().getNombreRol());
        assertEquals(true, guardado.getEstado());

        verify(encoder).encode("ClaveFicticia123");

        ArgumentCaptor<Auditoria> auditoriaCaptor =
                ArgumentCaptor.forClass(Auditoria.class);

        verify(auditoriaRepository).save(auditoriaCaptor.capture());

        assertEquals(
                "REGISTRO_USUARIO",
                auditoriaCaptor.getValue().getAccion()
        );
        assertEquals(
                "usuarios",
                auditoriaCaptor.getValue().getTablaAfectada()
        );
    }

    @Test
    void registrarCorreoExistenteDebeLanzarExcepcion() {
        RegistroUsuarioRequest request = new RegistroUsuarioRequest(
                "Usuario Prueba",
                "existente@example.test",
                "ClaveFicticia123"
        );

        when(users.existsByCorreo("existente@example.test"))
                .thenReturn(true);

        IllegalArgumentException excepcion = assertThrows(
                IllegalArgumentException.class,
                () -> authService.registrar(request)
        );

        assertEquals(
                "El correo ya está registrado",
                excepcion.getMessage()
        );

        verifyNoInteractions(
                roles,
                encoder,
                auditoriaRepository
        );
    }

    @Test
    void loginConCredencialesInvalidasNoDebeGenerarTokenNiRegistrarAuditoria() {
        LoginRequest request = new LoginRequest(
                "prueba@example.test",
                "ClaveFicticia123"
        );

        when(auth.authenticate(
                any(UsernamePasswordAuthenticationToken.class)
        )).thenThrow(
                new BadCredentialsException("Credenciales inválidas")
        );

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        verifyNoInteractions(users, auditoriaRepository, jwt);
    }
}