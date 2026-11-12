package com.centroconectado.api.common.exception;

import java.time.Instant;
import java.util.Map;

/** Formato único de error para todo el frontend: siempre leé "mensaje" y, si hay, "campos". */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String mensaje,
        String path,
        Map<String, String> campos) {
}
