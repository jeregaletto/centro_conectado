package com.centroconectado.api.usuarios.dto;

public record SectorDto(Long id, String codigo, String nombre, String descripcion, ContactoDto referente,
                        long integrantes) {
}
