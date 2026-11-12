package com.centroconectado.api.pedidos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoMovimientoRepository extends JpaRepository<PedidoMovimiento, Long> {

    List<PedidoMovimiento> findByPedidoIdOrderByCreadoEnAsc(Long pedidoId);
}
