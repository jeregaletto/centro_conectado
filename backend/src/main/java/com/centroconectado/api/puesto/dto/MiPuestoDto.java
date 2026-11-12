package com.centroconectado.api.puesto.dto;

import java.time.LocalDate;
import java.util.List;

import com.centroconectado.api.usuarios.dto.ContactoDto;

public record MiPuestoDto(
        LocalDate fecha,
        String puesto,
        String sector,
        List<TareaDelDiaDto> tareas,
        AvanceDto avance,
        ContactoDto referente,
        List<ProtocoloDto> protocolos) {
}
