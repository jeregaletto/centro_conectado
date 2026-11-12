package com.centroconectado.api.inicio.dto;

import java.time.LocalDate;
import java.util.List;

import com.centroconectado.api.agenda.dto.EventoDto;
import com.centroconectado.api.avisos.dto.AvisoDto;
import com.centroconectado.api.puesto.dto.AvanceDto;
import com.centroconectado.api.usuarios.Vista;

/** Todo lo que pinta la pantalla Inicio en un solo request. */
public record InicioDto(
        LocalDate fecha,
        String saludo,
        String nombre,
        String rolEtiqueta,
        Vista vista,
        /** Fijados arriba + los de lectura obligatoria que todavía no leíste. */
        List<AvisoDto> fijados,
        List<AvisoDto> novedades,
        List<EventoDto> agendaHoy,
        long notificacionesNoLeidas,
        long pedidosPendientes,
        AvanceDto tareasHoy) {
}
