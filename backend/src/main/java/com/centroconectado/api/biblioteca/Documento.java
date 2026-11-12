package com.centroconectado.api.biblioteca;

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
@Table(name = "documentos")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoriaDocumento categoria;

    /** Link al PDF (Drive institucional, SharePoint o /docs del propio servidor). */
    @Column(nullable = false, length = 500)
    private String url;

    /** Null = aplica a todo el Centro. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id")
    private Sector sector;

    @Column(length = 20)
    private String version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "publicado_por_id", nullable = false)
    private Usuario publicadoPor;

    @Column(name = "publicado_en", nullable = false)
    private LocalDateTime publicadoEn;

    @Column(name = "vigente_hasta", nullable = false)
    private LocalDateTime vigenteHasta;

    @Column(nullable = false)
    private boolean activo = true;

    protected Documento() {
    }

    public Documento(String titulo, String descripcion, CategoriaDocumento categoria, String url, Sector sector,
                     String version, Usuario publicadoPor, LocalDateTime publicadoEn, LocalDateTime vigenteHasta) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.url = url;
        this.sector = sector;
        this.version = version;
        this.publicadoPor = publicadoPor;
        this.publicadoEn = publicadoEn;
        this.vigenteHasta = vigenteHasta;
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public CategoriaDocumento getCategoria() { return categoria; }
    public void setCategoria(CategoriaDocumento categoria) { this.categoria = categoria; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Sector getSector() { return sector; }
    public void setSector(Sector sector) { this.sector = sector; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public Usuario getPublicadoPor() { return publicadoPor; }
    public LocalDateTime getPublicadoEn() { return publicadoEn; }
    public void setPublicadoEn(LocalDateTime publicadoEn) { this.publicadoEn = publicadoEn; }
    public LocalDateTime getVigenteHasta() { return vigenteHasta; }
    public void setVigenteHasta(LocalDateTime vigenteHasta) { this.vigenteHasta = vigenteHasta; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
