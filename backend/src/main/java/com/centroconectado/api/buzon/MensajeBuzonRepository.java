package com.centroconectado.api.buzon;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeBuzonRepository extends JpaRepository<MensajeBuzon, Long> {

    Optional<MensajeBuzon> findByCodigoSeguimiento(String codigo);

    boolean existsByCodigoSeguimiento(String codigo);

    List<MensajeBuzon> findByAutorIdOrderByCreadoEnDesc(Long autorId);

    List<MensajeBuzon> findAllByOrderByCreadoEnDesc();

    List<MensajeBuzon> findByEstadoIn(Collection<EstadoMensaje> estados);

    long countByEstadoIn(Collection<EstadoMensaje> estados);
}
