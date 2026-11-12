package com.centroconectado.api.puesto;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRegistroRepository extends JpaRepository<TareaRegistro, Long> {

    List<TareaRegistro> findByUsuarioIdAndPeriodoIn(Long usuarioId, Collection<LocalDate> periodos);

    Optional<TareaRegistro> findByTareaIdAndUsuarioIdAndPeriodo(Long tareaId, Long usuarioId, LocalDate periodo);

    List<TareaRegistro> findByTareaSectorIdAndPeriodoIn(Long sectorId, Collection<LocalDate> periodos);
}
