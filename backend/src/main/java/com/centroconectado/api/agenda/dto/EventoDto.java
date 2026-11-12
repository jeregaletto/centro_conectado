package com.centroconectado.api.agenda.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.centroconectado.api.agenda.Evento;
import com.centroconectado.api.agenda.TipoEvento;
import com.centroconectado.api.usuarios.Sector;

public record EventoDto(Long id, String titulo, String descripcion, TipoEvento tipo, String lugar,
                        LocalDateTime inicio, LocalDateTime fin, Integer recordatorioMinutos, String autor,
                        List<String> sectores) {

    public static EventoDto de(Evento e) {
        return new EventoDto(e.getId(), e.getTitulo(), e.getDescripcion(), e.getTipo(), e.getLugar(), e.getInicio(),
                e.getFin(), e.getRecordatorioMinutos(), e.getAutor().getNombreCompleto(),
                e.getSectores().stream().map(Sector::getNombre).sorted().toList());
    }
}
