package com.centroconectado.api.avisos.dto;

import java.util.List;

import com.centroconectado.api.usuarios.dto.ContactoDto;

public record LecturasDto(Long avisoId, int destinatarios, int leyeron, int porcentaje, List<ContactoDto> pendientes) {
}
