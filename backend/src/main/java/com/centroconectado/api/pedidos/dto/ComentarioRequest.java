package com.centroconectado.api.pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioRequest(@NotBlank @Size(max = 1000) String comentario) {
}
