package com.centroconectado.api.avisos;

import java.time.LocalDateTime;

import com.centroconectado.api.usuarios.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "aviso_lecturas")
public class LecturaAviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aviso_id", nullable = false)
    private Aviso aviso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "leido_en", nullable = false)
    private LocalDateTime leidoEn;

    protected LecturaAviso() {
    }

    public LecturaAviso(Aviso aviso, Usuario usuario, LocalDateTime leidoEn) {
        this.aviso = aviso;
        this.usuario = usuario;
        this.leidoEn = leidoEn;
    }

    public Long getId() { return id; }
    public Aviso getAviso() { return aviso; }
    public Usuario getUsuario() { return usuario; }
    public LocalDateTime getLeidoEn() { return leidoEn; }
}
