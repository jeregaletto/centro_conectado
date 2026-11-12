package com.centroconectado.api.puesto.dto;

import com.centroconectado.api.puesto.Frecuencia;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuardarTareaRequest(
        @NotNull Long sectorId,
        @Size(max = 80) String puesto,
        @NotBlank @Size(max = 120) String titulo,
        @Size(max = 500) String descripcion,
        @NotBlank @Size(max = 40) String icono,
        @NotNull Frecuencia frecuencia,
        @Min(0) int orden) {
}
