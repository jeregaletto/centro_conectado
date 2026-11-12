package com.centroconectado.api.buzon.dto;

import com.centroconectado.api.buzon.TipoMensaje;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EnviarMensajeRequest(
        @NotNull TipoMensaje tipo,
        @NotBlank @Size(max = 150) String asunto,
        @NotBlank @Size(max = 4000) String cuerpo,
        boolean anonimo) {
}
