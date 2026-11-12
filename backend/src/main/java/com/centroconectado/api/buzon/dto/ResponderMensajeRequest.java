package com.centroconectado.api.buzon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResponderMensajeRequest(@NotBlank @Size(max = 4000) String respuesta) {
}
