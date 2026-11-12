package com.centroconectado.api.biblioteca;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @Query("""
            select d from Documento d left join fetch d.sector s
            where d.activo = true and d.vigenteHasta >= :ahora
            order by d.categoria, d.titulo
            """)
    List<Documento> findVigentes(@Param("ahora") LocalDateTime ahora);

    @Query("""
            select d from Documento d left join d.sector s
            where d.activo = true
              and d.vigenteHasta >= :ahora
              and d.categoria = :categoria
              and (s is null or s.id = :sectorId)
            order by d.titulo
            """)
    List<Documento> findVigentesPorCategoriaYSector(@Param("categoria") CategoriaDocumento categoria,
                                                    @Param("sectorId") Long sectorId,
                                                    @Param("ahora") LocalDateTime ahora);

    List<Documento> findByActivoTrueAndVigenteHastaBetweenOrderByVigenteHastaAsc(LocalDateTime desde,
                                                                                  LocalDateTime hasta);
}
