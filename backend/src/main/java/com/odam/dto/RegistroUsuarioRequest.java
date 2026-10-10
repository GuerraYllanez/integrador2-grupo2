package com.odam.dto; import jakarta.validation.constraints.*;
public record RegistroUsuarioRequest(@NotBlank @Size(max=100) @Pattern(regexp="^[^<>]*$", message="El nombre no puede contener etiquetas HTML") String nombreUsuario,@NotBlank @Email @Size(max=150) String correo,@NotBlank @Size(min=6,max=100) String contrasena) {}
