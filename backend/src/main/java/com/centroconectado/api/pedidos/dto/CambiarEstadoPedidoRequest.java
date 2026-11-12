package com.centroconectado.api.pedidos.dto;

import com.centroconectado.api.pedidos.EstadoPedido;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CambiarEstadoPedidoRequest(@NotNull EstadoPedido estado, @Size(max = 1000) String comentario) {
}
