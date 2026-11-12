package com.centroconectado.api.puesto.dto;

public record AvanceDto(int hechas, int total, int porcentaje) {

    public static AvanceDto de(int hechas, int total) {
        return new AvanceDto(hechas, total, total == 0 ? 0 : Math.round(hechas * 100f / total));
    }
}
