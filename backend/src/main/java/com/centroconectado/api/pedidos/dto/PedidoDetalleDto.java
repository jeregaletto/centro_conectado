package com.centroconectado.api.pedidos.dto;

import java.util.List;

public record PedidoDetalleDto(PedidoDto pedido, List<MovimientoDto> historial, boolean puedoCambiarEstado,
                               boolean puedoCancelar) {
}
