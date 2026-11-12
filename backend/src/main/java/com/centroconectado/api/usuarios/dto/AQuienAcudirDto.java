package com.centroconectado.api.usuarios.dto;

import com.centroconectado.api.usuarios.AQuienAcudir;

public record AQuienAcudirDto(Long id, String tema, String descripcion, SectorResumenDto sector,
                              ContactoDto contacto) {

    public static AQuienAcudirDto de(AQuienAcudir a) {
        return new AQuienAcudirDto(a.getId(), a.getTema(), a.getDescripcion(), SectorResumenDto.de(a.getSector()),
                ContactoDto.de(a.getContacto()));
    }
}
