package com.centroconectado.api.biblioteca.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.biblioteca.CategoriaDocumento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GuardarDocumentoRequest(
        @NotBlank @Size(max = 150) String titulo,
        @Size(max = 500) String descripcion,
        @NotNull CategoriaDocumento categoria,
        @NotBlank @Size(max = 500)
        @Pattern(regexp = "^(https://|/).*", message = "La URL tiene que empezar con https:// o /")
        String url,
        Long sectorId,
        @Size(max = 20) String version,
        LocalDateTime vigenteHasta) {
}
