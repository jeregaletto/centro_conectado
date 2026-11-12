package com.centroconectado.api.puesto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TareaPuestoRepository extends JpaRepository<TareaPuesto, Long> {

    @Query("""
            select t from TareaPuesto t
            where t.activa = true
              and t.sector.id = :sectorId
              and (t.puesto is null or lower(t.puesto) = lower(:puesto))
            order by t.frecuencia, t.orden
            """)
    List<TareaPuesto> findAplicables(@Param("sectorId") Long sectorId, @Param("puesto") String puesto);

    List<TareaPuesto> findBySectorIdAndActivaTrueOrderByFrecuenciaAscOrdenAsc(Long sectorId);
}
