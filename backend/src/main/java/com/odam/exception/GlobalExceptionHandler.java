package com.odam.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> respuesta(
            HttpStatus estado,
            String codigo,
            String mensaje,
            Object detalles
    ) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("estado", estado.value());
        cuerpo.put("error", codigo);
        cuerpo.put("mensaje", mensaje);

        if (detalles != null) {
            cuerpo.put("detalles", detalles);
        }

        return ResponseEntity.status(estado).body(cuerpo);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(
            MethodArgumentNotValidException e
    ) {
        Map<String, String> errores = new LinkedHashMap<>();

        e.getBindingResult().getFieldErrors().forEach(error ->
                errores.putIfAbsent(
                        error.getField(),
                        error.getDefaultMessage() != null
                                ? error.getDefaultMessage()
                                : "Dato inválido"
                )
        );

        return respuesta(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Los datos enviados no son válidos",
                errores
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> constraintViolation(
            ConstraintViolationException e
    ) {
        Map<String, String> errores = e.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        violation -> violation.getMessage(),
                        (primero, segundo) -> primero,
                        LinkedHashMap::new
                ));

        return respuesta(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Los datos enviados no son válidos",
                errores
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> badCredentials() {
        return respuesta(
                HttpStatus.UNAUTHORIZED,
                "BAD_CREDENTIALS",
                "Credenciales inválidas",
                null
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> unreadableMessage() {
        return respuesta(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_BODY",
                "El cuerpo de la solicitud no tiene un formato válido",
                null
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> methodNotSupported() {
        return respuesta(
                HttpStatus.METHOD_NOT_ALLOWED,
                "METHOD_NOT_ALLOWED",
                "El método HTTP utilizado no está permitido para este recurso",
                null
        );
    }

    @ExceptionHandler({
            EntityNotFoundException.class,
            NoSuchElementException.class,
            NoResourceFoundException.class
    })
    public ResponseEntity<Map<String, Object>> notFound() {
        return respuesta(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                "No se encontró el recurso solicitado",
                null
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> dataIntegrityViolation() {
        return respuesta(
                HttpStatus.CONFLICT,
                "DATA_INTEGRITY_CONFLICT",
                "No se puede completar la operación porque el registro "
                        + "está relacionado con otros datos del sistema. "
                        + "Verifique las dependencias antes de continuar.",
                null
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> illegal(
            IllegalArgumentException e
    ) {
        return respuesta(
                HttpStatus.BAD_REQUEST,
                "REQUEST_ERROR",
                e.getMessage() != null
                        ? e.getMessage()
                        : "La solicitud contiene datos no válidos",
                null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> unexpected() {
        return respuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Ocurrió un error interno. Intente nuevamente más tarde",
                null
        );
    }
}