package com.centroconectado.api.pedidos.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.pedidos.EstadoPedido;

public record MovimientoDto(Long id, String usuario, EstadoPedido estadoAnterior, EstadoPedido estadoNuevo,
                            String comentario, LocalDateTime creadoEn) {
}
