package com.centroconectado.api.pedidos.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.pedidos.Prioridad;
import com.centroconectado.api.pedidos.TipoPedido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearPedidoRequest(
        @NotNull TipoPedido tipo,
        @NotBlank @Size(max = 150) String asunto,
        @NotBlank @Size(max = 2000) String detalle,
        @NotNull Long sectorDestinoId,
        /** Default MEDIA. */
        Prioridad prioridad,
        /** Opcional: si no viene se calcula por prioridad (24/72/168 h). */
        LocalDateTime plazo,
        Long asignadoAId) {
}
