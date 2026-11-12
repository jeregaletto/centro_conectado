package com.centroconectado.api.usuarios.dto;

import com.centroconectado.api.usuarios.Sector;

public record SectorResumenDto(Long id, String codigo, String nombre) {

    public static SectorResumenDto de(Sector s) {
        return s == null ? null : new SectorResumenDto(s.getId(), s.getCodigo(), s.getNombre());
    }
}
