package com.centroconectado.api.puesto.dto;

import com.centroconectado.api.usuarios.dto.ContactoDto;

public record AvanceUsuarioDto(ContactoDto usuario, AvanceDto avance) {
}
