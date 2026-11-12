package com.centroconectado.api.common.dto;

import java.time.LocalDateTime;

/** Si vigenteHasta viene vacío se aplica la vigencia por defecto (30 días). */
public record RenovarRequest(LocalDateTime vigenteHasta) {
}
