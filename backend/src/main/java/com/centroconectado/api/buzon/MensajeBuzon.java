package com.centroconectado.api.buzon;

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

/**
 * Si es anónimo NO se guarda autor ni sector: el anonimato es real, no "oculto en pantalla".
 * El seguimiento se hace con el código que recibe quien lo envía.
 */
@Entity
@Table(name = "buzon_mensajes")
public class MensajeBuzon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_seguimiento", nullable = false, unique = true, length = 16)
    private String codigoSeguimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMensaje tipo;

    @Column(nullable = false, length = 150)
    private String asunto;

    @Column(nullable = false, length = 4000)
    private String cuerpo;

    @Column(nullable = false)
    private boolean anonimo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id")
    private Usuario autor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id")
    private Sector sector;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoMensaje estado = EstadoMensaje.RECIBIDO;

    @Column(name = "plazo_respuesta", nullable = false)
    private LocalDateTime plazoRespuesta;

    @Column(length = 4000)
    private String respuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "respondido_por_id")
    private Usuario respondidoPor;

    @Column(name = "respondido_en")
    private LocalDateTime respondidoEn;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    protected MensajeBuzon() {
    }

    public MensajeBuzon(String codigoSeguimiento, TipoMensaje tipo, String asunto, String cuerpo, boolean anonimo,
                        Usuario autor, Sector sector, LocalDateTime plazoRespuesta, LocalDateTime creadoEn) {
        this.codigoSeguimiento = codigoSeguimiento;
        this.tipo = tipo;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.anonimo = anonimo;
        this.autor = anonimo ? null : autor;
        this.sector = anonimo ? null : sector;
        this.plazoRespuesta = plazoRespuesta;
        this.creadoEn = creadoEn;
    }

    public boolean estaVencido(LocalDateTime ahora) {
        return (estado == EstadoMensaje.RECIBIDO || estado == EstadoMensaje.EN_REVISION)
                && plazoRespuesta.isBefore(ahora);
    }

    public void responder(String respuesta, Usuario por, LocalDateTime ahora) {
        this.respuesta = respuesta;
        this.respondidoPor = por;
        this.respondidoEn = ahora;
        this.estado = EstadoMensaje.RESPONDIDO;
    }

    public Long getId() { return id; }
    public String getCodigoSeguimiento() { return codigoSeguimiento; }
    public TipoMensaje getTipo() { return tipo; }
    public String getAsunto() { return asunto; }
    public String getCuerpo() { return cuerpo; }
    public boolean isAnonimo() { return anonimo; }
    public Usuario getAutor() { return autor; }
    public Sector getSector() { return sector; }
    public EstadoMensaje getEstado() { return estado; }
    public void setEstado(EstadoMensaje estado) { this.estado = estado; }
    public LocalDateTime getPlazoRespuesta() { return plazoRespuesta; }
    public String getRespuesta() { return respuesta; }
    public Usuario getRespondidoPor() { return respondidoPor; }
    public LocalDateTime getRespondidoEn() { return respondidoEn; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
