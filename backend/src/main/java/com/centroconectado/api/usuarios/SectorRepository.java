package com.centroconectado.api.usuarios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SectorRepository extends JpaRepository<Sector, Long> {

    Optional<Sector> findByCodigo(String codigo);

    List<Sector> findAllByOrderByNombreAsc();
}
