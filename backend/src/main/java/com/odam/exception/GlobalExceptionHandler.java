package com.odam.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<?> validation(MethodArgumentNotValidException e) {

    Map<String, String> errores = new LinkedHashMap<>();

    e.getBindingResult().getFieldErrors().forEach(error ->
            errores.putIfAbsent(
                    error.getField(),
                    error.getDefaultMessage() != null
                            ? error.getDefaultMessage()
                            : "Dato inválido"
            )
    );

    Map<String, Object> respuesta = new LinkedHashMap<>();
    respuesta.put("error", "VALIDATION_ERROR");
    respuesta.put("mensaje", "Datos de entrada inválidos");
    respuesta.put("detalles", errores);

    return ResponseEntity.badRequest().body(respuesta);
}

@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<?> badCredentials() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of(
                    "error", "BAD_CREDENTIALS",
                    "mensaje", "Credenciales inválidas"
            ));
}

@ExceptionHandler(IllegalArgumentException.class)
public ResponseEntity<?> illegal(IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(Map.of(
            "error", "REQUEST_ERROR",
            "mensaje", e.getMessage()
    ));
}

}
