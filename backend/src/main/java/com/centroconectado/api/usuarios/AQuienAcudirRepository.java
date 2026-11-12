package com.centroconectado.api.usuarios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AQuienAcudirRepository extends JpaRepository<AQuienAcudir, Long> {

    List<AQuienAcudir> findAllByOrderByOrdenAsc();
}
