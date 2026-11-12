package com.centroconectado.api.puesto.dto;

import com.centroconectado.api.puesto.Frecuencia;
import com.centroconectado.api.puesto.TareaPuesto;
import com.centroconectado.api.usuarios.dto.SectorResumenDto;

public record TareaPuestoDto(Long id, SectorResumenDto sector, String puesto, String titulo, String descripcion,
                             String icono, Frecuencia frecuencia, int orden, boolean activa) {

    public static TareaPuestoDto de(TareaPuesto t) {
        return new TareaPuestoDto(t.getId(), SectorResumenDto.de(t.getSector()), t.getPuesto(), t.getTitulo(),
                t.getDescripcion(), t.getIcono(), t.getFrecuencia(), t.getOrden(), t.isActiva());
    }
}
