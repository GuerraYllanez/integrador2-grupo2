package com.odam.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void credencialesIncorrectasDebeResponder401() {
        ResponseEntity<Map<String, Object>> respuesta =
                handler.badCredentials();

        assertEquals(HttpStatus.UNAUTHORIZED, respuesta.getStatusCode());
        assertEquals(401, respuesta.getBody().get("estado"));
        assertEquals("BAD_CREDENTIALS", respuesta.getBody().get("error"));
        assertEquals(
                "Credenciales inválidas",
                respuesta.getBody().get("mensaje")
        );
    }

    @Test
    void cuerpoInvalidoDebeResponder400() {
        ResponseEntity<Map<String, Object>> respuesta =
                handler.unreadableMessage();

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertEquals(
                "INVALID_REQUEST_BODY",
                respuesta.getBody().get("error")
        );
    }

    @Test
    void metodoNoPermitidoDebeResponder405() {
        ResponseEntity<Map<String, Object>> respuesta =
                handler.methodNotSupported();

        assertEquals(
                HttpStatus.METHOD_NOT_ALLOWED,
                respuesta.getStatusCode()
        );
        assertEquals(
                "METHOD_NOT_ALLOWED",
                respuesta.getBody().get("error")
        );
    }

    @Test
    void recursoInexistenteDebeResponder404() {
        ResponseEntity<Map<String, Object>> respuesta =
                handler.notFound();

        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
        assertEquals(
                "RESOURCE_NOT_FOUND",
                respuesta.getBody().get("error")
        );
        assertFalse(respuesta.getBody().containsKey("detalles"));
    }

    @Test
    void argumentoInvalidoDebeResponder400ConMensaje() {
        ResponseEntity<Map<String, Object>> respuesta =
                handler.illegal(
                        new IllegalArgumentException("Dato de prueba inválido")
                );

        assertEquals(HttpStatus.BAD_REQUEST, respuesta.getStatusCode());
        assertEquals("REQUEST_ERROR", respuesta.getBody().get("error"));
        assertEquals(
                "Dato de prueba inválido",
                respuesta.getBody().get("mensaje")
        );
    }

    @Test
    void errorInesperadoDebeResponder500SinExponerDetallesInternos() {
        ResponseEntity<Map<String, Object>> respuesta =
                handler.unexpected();

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                respuesta.getStatusCode()
        );
        assertEquals(
                "INTERNAL_SERVER_ERROR",
                respuesta.getBody().get("error")
        );
        assertEquals(
                "Ocurrió un error interno. Intente nuevamente más tarde",
                respuesta.getBody().get("mensaje")
        );
        assertNotNull(respuesta.getBody());
    }
}