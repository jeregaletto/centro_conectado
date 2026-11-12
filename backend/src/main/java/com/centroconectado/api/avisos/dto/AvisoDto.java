package com.centroconectado.api.avisos.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.centroconectado.api.avisos.TipoAviso;

public record AvisoDto(
        Long id,
        String titulo,
        String cuerpo,
        TipoAviso tipo,
        boolean fijado,
        boolean requiereLectura,
        boolean leido,
        /** Id de quien publicó (para que cada referente vea lo suyo). */
        Long autorId,
        String autor,
        LocalDateTime publicadoEn,
        LocalDateTime vigenteHasta,
        boolean porVencer,
        /** Vacío = todo el Centro. */
        List<String> sectores) {
}
