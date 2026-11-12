package com.centroconectado.api.avisos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvisoRepository extends JpaRepository<Aviso, Long> {

    @Query("""
            select distinct a from Aviso a left join a.sectores s
            where a.activo = true
              and a.vigenteHasta >= :ahora
              and (a.sectores is empty or s.id = :sectorId)
            order by a.fijado desc, a.publicadoEn desc
            """)
    List<Aviso> findVisibles(@Param("sectorId") Long sectorId, @Param("ahora") LocalDateTime ahora);

    List<Aviso> findByActivoTrueAndVigenteHastaBetweenOrderByVigenteHastaAsc(LocalDateTime desde,
                                                                              LocalDateTime hasta);
}
