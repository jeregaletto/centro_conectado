package com.centroconectado.api.buzon.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.buzon.EstadoMensaje;
import com.centroconectado.api.buzon.TipoMensaje;

public record MensajeBuzonDto(
        Long id,
        String codigoSeguimiento,
        TipoMensaje tipo,
        String asunto,
        String cuerpo,
        boolean anonimo,
        /** Solo visible para gestores y si no es anónimo. */
        String autor,
        String sector,
        EstadoMensaje estado,
        LocalDateTime creadoEn,
        LocalDateTime plazoRespuesta,
        boolean vencido,
        String respuesta,
        LocalDateTime respondidoEn) {
}
