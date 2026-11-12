package com.centroconectado.api.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarPasswordRequest(
        @NotBlank String actual,
        @NotBlank @Size(min = 8, max = 100, message = "La nueva contraseña debe tener entre 8 y 100 caracteres") String nueva) {
}
