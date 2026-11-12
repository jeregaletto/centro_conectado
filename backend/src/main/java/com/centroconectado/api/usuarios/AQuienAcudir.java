package com.centroconectado.api.usuarios;

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
@Table(name = "a_quien_acudir")
public class AQuienAcudir {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String tema;

    @Column(length = 500)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contacto_id")
    private Usuario contacto;

    @Column(nullable = false)
    private int orden;

    protected AQuienAcudir() {
    }

    public AQuienAcudir(String tema, String descripcion, Sector sector, Usuario contacto, int orden) {
        this.tema = tema;
        this.descripcion = descripcion;
        this.sector = sector;
        this.contacto = contacto;
        this.orden = orden;
    }

    public Long getId() { return id; }
    public String getTema() { return tema; }
    public String getDescripcion() { return descripcion; }
    public Sector getSector() { return sector; }
    public Usuario getContacto() { return contacto; }
    public int getOrden() { return orden; }
}
