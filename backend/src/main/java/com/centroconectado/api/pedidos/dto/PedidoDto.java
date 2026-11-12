package com.centroconectado.api.pedidos.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.pedidos.EstadoPedido;
import com.centroconectado.api.pedidos.Prioridad;
import com.centroconectado.api.pedidos.TipoPedido;
import com.centroconectado.api.usuarios.dto.SectorResumenDto;

public record PedidoDto(
        Long id,
        String codigo,
        TipoPedido tipo,
        String asunto,
        String detalle,
        Prioridad prioridad,
        EstadoPedido estado,
        SectorResumenDto sectorOrigen,
        SectorResumenDto sectorDestino,
        String creadoPor,
        String asignadoA,
        LocalDateTime plazo,
        boolean vencido,
        /** Horas que faltan para el plazo (negativo = vencido). Null si está cerrado. */
        Long horasRestantes,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        LocalDateTime cerradoEn) {
}
