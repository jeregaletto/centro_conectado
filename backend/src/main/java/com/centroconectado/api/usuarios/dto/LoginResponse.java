package com.centroconectado.api.usuarios.dto;

import java.time.Instant;

public record LoginResponse(String token, Instant expiraEn, UsuarioActualDto usuario) {
}
