package com.centroconectado.api.inicio.dto;

import java.time.LocalDate;
import java.util.List;

import com.centroconectado.api.agenda.dto.EventoDto;

public record ResumenSemanalDto(
        LocalDate desde,
        LocalDate hasta,
        int avisosNuevos,
        List<String> avisosDestacados,
        List<EventoDto> agendaSemana,
        long pedidosPendientes,
        long pedidosVencidos,
        /** Solo para gestores del buzón; null para el resto. */
        Long buzonSinResponder) {
}
