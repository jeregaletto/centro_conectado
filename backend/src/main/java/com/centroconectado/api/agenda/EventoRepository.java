package com.centroconectado.api.agenda;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    @Query("""
            select distinct e from Evento e left join e.sectores s
            where e.inicio < :hasta
              and e.fin >= :desde
              and (e.sectores is empty or s.id = :sectorId)
            order by e.inicio
            """)
    List<Evento> findVisiblesEntre(@Param("sectorId") Long sectorId,
                                   @Param("desde") LocalDateTime desde,
                                   @Param("hasta") LocalDateTime hasta);

    List<Evento> findByRecordatorioEnviadoFalseAndRecordatorioMinutosIsNotNullAndInicioBetween(LocalDateTime desde,
                                                                                               LocalDateTime hasta);
}
