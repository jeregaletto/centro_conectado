package com.centroconectado.api.usuarios.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarReferenteRequest(@NotNull Long usuarioId) {
}
