package com.centroconectado.api.pedidos;

import java.time.LocalDateTime;

import com.centroconectado.api.usuarios.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Historial: cada cambio de estado o comentario queda registrado. */
@Entity
@Table(name = "pedido_movimientos")
public class PedidoMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_anterior", length = 20)
    private EstadoPedido estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_nuevo", length = 20)
    private EstadoPedido estadoNuevo;

    @Column(length = 1000)
    private String comentario;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    protected PedidoMovimiento() {
    }

    public PedidoMovimiento(Pedido pedido, Usuario usuario, EstadoPedido estadoAnterior, EstadoPedido estadoNuevo,
                            String comentario, LocalDateTime creadoEn) {
        this.pedido = pedido;
        this.usuario = usuario;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.comentario = comentario;
        this.creadoEn = creadoEn;
    }

    public Long getId() { return id; }
    public Pedido getPedido() { return pedido; }
    public Usuario getUsuario() { return usuario; }
    public EstadoPedido getEstadoAnterior() { return estadoAnterior; }
    public EstadoPedido getEstadoNuevo() { return estadoNuevo; }
    public String getComentario() { return comentario; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
