package com.centroconectado.api.pedidos;

import java.time.LocalDateTime;

import com.centroconectado.api.usuarios.Sector;
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

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código legible "PED-000123", se asigna después del insert. */
    @Column(unique = true, length = 20)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoPedido tipo;

    @Column(nullable = false, length = 150)
    private String asunto;

    @Column(nullable = false, length = 2000)
    private String detalle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Prioridad prioridad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sector_origen_id", nullable = false)
    private Sector sectorOrigen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sector_destino_id", nullable = false)
    private Sector sectorDestino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creado_por_id", nullable = false)
    private Usuario creadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_a_id")
    private Usuario asignadoA;

    @Column(nullable = false)
    private LocalDateTime plazo;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "cerrado_en")
    private LocalDateTime cerradoEn;

    protected Pedido() {
    }

    public Pedido(TipoPedido tipo, String asunto, String detalle, Prioridad prioridad, Sector sectorOrigen,
                  Sector sectorDestino, Usuario creadoPor, Usuario asignadoA, LocalDateTime plazo,
                  LocalDateTime ahora) {
        this.tipo = tipo;
        this.asunto = asunto;
        this.detalle = detalle;
        this.prioridad = prioridad;
        this.sectorOrigen = sectorOrigen;
        this.sectorDestino = sectorDestino;
        this.creadoPor = creadoPor;
        this.asignadoA = asignadoA;
        this.plazo = plazo;
        this.creadoEn = ahora;
        this.actualizadoEn = ahora;
    }

    public boolean estaVencido(LocalDateTime ahora) {
        return !estado.esTerminal() && plazo.isBefore(ahora);
    }

    public boolean involucraSector(Long sectorId) {
        return sectorOrigen.getId().equals(sectorId) || sectorDestino.getId().equals(sectorId);
    }

    public void cambiarEstado(EstadoPedido nuevo, LocalDateTime ahora) {
        this.estado = nuevo;
        this.actualizadoEn = ahora;
        this.cerradoEn = nuevo.esTerminal() ? ahora : null;
    }

    public void tocar(LocalDateTime ahora) {
        this.actualizadoEn = ahora;
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public TipoPedido getTipo() { return tipo; }
    public String getAsunto() { return asunto; }
    public String getDetalle() { return detalle; }
    public Prioridad getPrioridad() { return prioridad; }
    public EstadoPedido getEstado() { return estado; }
    public Sector getSectorOrigen() { return sectorOrigen; }
    public Sector getSectorDestino() { return sectorDestino; }
    public Usuario getCreadoPor() { return creadoPor; }
    public Usuario getAsignadoA() { return asignadoA; }
    public void setAsignadoA(Usuario asignadoA) { this.asignadoA = asignadoA; }
    public LocalDateTime getPlazo() { return plazo; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public LocalDateTime getCerradoEn() { return cerradoEn; }
}
