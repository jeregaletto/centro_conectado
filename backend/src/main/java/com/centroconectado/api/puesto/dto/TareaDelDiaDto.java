package com.centroconectado.api.puesto.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.puesto.Frecuencia;

public record TareaDelDiaDto(Long id, String titulo, String descripcion, String icono, Frecuencia frecuencia,
                             boolean completada, LocalDateTime completadaEn) {
}
