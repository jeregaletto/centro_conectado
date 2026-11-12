package com.centroconectado.api.usuarios.dto;

import com.centroconectado.api.usuarios.Rol;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearUsuarioRequest(
        @NotBlank @Size(max = 40) String usuario,
        @NotBlank @Size(max = 80) String nombre,
        @NotBlank @Size(max = 80) String apellido,
        @Email @Size(max = 150) String email,
        @Size(max = 40) String telefono,
        @Size(max = 20) String interno,
        @NotBlank @Size(max = 80) String puesto,
        @NotNull Rol rol,
        @NotNull Long sectorId,
        @NotBlank @Size(min = 8, max = 100) String passwordInicial) {
}
