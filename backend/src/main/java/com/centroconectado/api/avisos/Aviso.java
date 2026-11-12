package com.centroconectado.api.avisos;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "avisos")
public class Aviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 4000)
    private String cuerpo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoAviso tipo;

    @Column(nullable = false)
    private boolean fijado;

    @Column(name = "requiere_lectura", nullable = false)
    private boolean requiereLectura;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(name = "publicado_en", nullable = false)
    private LocalDateTime publicadoEn;

    @Column(name = "vigente_hasta", nullable = false)
    private LocalDateTime vigenteHasta;

    @Column(nullable = false)
    private boolean activo = true;

    /** Vacío = todo el Centro. */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "aviso_sectores",
            joinColumns = @JoinColumn(name = "aviso_id"),
            inverseJoinColumns = @JoinColumn(name = "sector_id"))
    private Set<Sector> sectores = new HashSet<>();

    protected Aviso() {
    }

    public Aviso(String titulo, String cuerpo, TipoAviso tipo, boolean fijado, boolean requiereLectura,
                 Usuario autor, LocalDateTime publicadoEn, LocalDateTime vigenteHasta) {
        this.titulo = titulo;
        this.cuerpo = cuerpo;
        this.tipo = tipo;
        this.fijado = fijado;
        this.requiereLectura = requiereLectura;
        this.autor = autor;
        this.publicadoEn = publicadoEn;
        this.vigenteHasta = vigenteHasta;
    }

    public boolean esVisiblePara(Long sectorId, LocalDateTime ahora) {
        boolean alcanza = sectores.isEmpty() || sectores.stream().anyMatch(s -> s.getId().equals(sectorId));
        return activo && !vigenteHasta.isBefore(ahora) && alcanza;
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getCuerpo() { return cuerpo; }
    public void setCuerpo(String cuerpo) { this.cuerpo = cuerpo; }
    public TipoAviso getTipo() { return tipo; }
    public void setTipo(TipoAviso tipo) { this.tipo = tipo; }
    public boolean isFijado() { return fijado; }
    public void setFijado(boolean fijado) { this.fijado = fijado; }
    public boolean isRequiereLectura() { return requiereLectura; }
    public void setRequiereLectura(boolean requiereLectura) { this.requiereLectura = requiereLectura; }
    public Usuario getAutor() { return autor; }
    public LocalDateTime getPublicadoEn() { return publicadoEn; }
    public LocalDateTime getVigenteHasta() { return vigenteHasta; }
    public void setVigenteHasta(LocalDateTime vigenteHasta) { this.vigenteHasta = vigenteHasta; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public Set<Sector> getSectores() { return sectores; }

    public void reemplazarSectores(Set<Sector> nuevos) {
        sectores.clear();
        sectores.addAll(nuevos);
    }
}
