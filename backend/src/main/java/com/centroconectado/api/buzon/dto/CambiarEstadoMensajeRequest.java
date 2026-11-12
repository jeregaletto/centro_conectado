package com.centroconectado.api.buzon.dto;

import com.centroconectado.api.buzon.EstadoMensaje;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoMensajeRequest(@NotNull EstadoMensaje estado) {
}
