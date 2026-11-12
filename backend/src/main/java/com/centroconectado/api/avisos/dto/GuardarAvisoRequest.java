package com.centroconectado.api.avisos.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.centroconectado.api.avisos.TipoAviso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuardarAvisoRequest(
        @NotBlank @Size(max = 150) String titulo,
        @NotBlank @Size(max = 4000) String cuerpo,
        @NotNull TipoAviso tipo,
        boolean fijado,
        boolean requiereLectura,
        /** Opcional: si no viene, vence a los 30 días. */
        LocalDateTime vigenteHasta,
        /** Vacío = todo el Centro (solo Dirección/Comunicación). */
        List<Long> sectorIds) {
}
