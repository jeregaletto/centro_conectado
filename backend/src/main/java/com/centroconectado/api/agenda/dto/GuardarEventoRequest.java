package com.centroconectado.api.agenda.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.centroconectado.api.agenda.TipoEvento;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuardarEventoRequest(
        @NotBlank @Size(max = 150) String titulo,
        @Size(max = 2000) String descripcion,
        @NotNull TipoEvento tipo,
        @Size(max = 150) String lugar,
        @NotNull LocalDateTime inicio,
        @NotNull LocalDateTime fin,
        /** Minutos antes del inicio para enviar el recordatorio. Null = sin recordatorio. */
        @Min(5) @Max(10080) Integer recordatorioMinutos,
        List<Long> sectorIds) {
}
