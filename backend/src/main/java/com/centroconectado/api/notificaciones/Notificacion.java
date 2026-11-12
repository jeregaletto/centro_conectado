package com.centroconectado.api.notificaciones;

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

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoNotificacion tipo;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 1000)
    private String mensaje;

    /** Ruta del frontend a la que lleva el toque, ej: "/pedidos/12". */
    @Column(length = 255)
    private String link;

    @Column(nullable = false)
    private boolean leida;

    @Column(name = "creada_en", nullable = false)
    private LocalDateTime creadaEn;

    protected Notificacion() {
    }

    public Notificacion(Usuario usuario, TipoNotificacion tipo, String titulo, String mensaje, String link,
                        LocalDateTime creadaEn) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.link = link;
        this.creadaEn = creadaEn;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public TipoNotificacion getTipo() { return tipo; }
    public String getTitulo() { return titulo; }
    public String getMensaje() { return mensaje; }
    public String getLink() { return link; }
    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }
    public LocalDateTime getCreadaEn() { return creadaEn; }
}
