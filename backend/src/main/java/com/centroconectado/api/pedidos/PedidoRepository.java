package com.centroconectado.api.pedidos;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findTop100BySectorDestinoIdOrderByCreadoEnDesc(Long sectorId);

    List<Pedido> findTop100BySectorOrigenIdOrderByCreadoEnDesc(Long sectorId);

    List<Pedido> findTop200ByOrderByCreadoEnDesc();

    long countBySectorDestinoIdAndEstadoIn(Long sectorId, Collection<EstadoPedido> estados);

    List<Pedido> findBySectorDestinoIdAndEstadoIn(Long sectorId, Collection<EstadoPedido> estados);
}
