package com.odam.dto; import jakarta.validation.constraints.*;
public record LoginRequest(@NotBlank @Email String correo,@NotBlank @Size(min=6,max=100) String contrasena) {}
