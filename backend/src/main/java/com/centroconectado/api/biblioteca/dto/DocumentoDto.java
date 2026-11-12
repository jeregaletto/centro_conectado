package com.centroconectado.api.biblioteca.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.biblioteca.CategoriaDocumento;
import com.centroconectado.api.usuarios.dto.SectorResumenDto;

public record DocumentoDto(Long id, String titulo, String descripcion, CategoriaDocumento categoria, String url,
                           SectorResumenDto sector, String version, String publicadoPor, LocalDateTime publicadoEn,
                           LocalDateTime vigenteHasta, boolean porVencer) {
}
