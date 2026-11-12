package com.centroconectado.api.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Ingresá tu DNI o usuario") @Size(max = 40) String usuario,
        @NotBlank(message = "Ingresá tu contraseña") @Size(max = 100) String password) {
}
