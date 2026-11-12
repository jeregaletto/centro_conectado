package com.centroconectado.api.agenda;

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
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 2000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoEvento tipo;

    @Column(length = 150)
    private String lugar;

    @Column(nullable = false)
    private LocalDateTime inicio;

    @Column(nullable = false)
    private LocalDateTime fin;

    @Column(name = "recordatorio_minutos")
    private Integer recordatorioMinutos;

    @Column(name = "recordatorio_enviado", nullable = false)
    private boolean recordatorioEnviado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "evento_sectores",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "sector_id"))
    private Set<Sector> sectores = new HashSet<>();

    protected Evento() {
    }

    public Evento(String titulo, String descripcion, TipoEvento tipo, String lugar, LocalDateTime inicio,
                  LocalDateTime fin, Integer recordatorioMinutos, Usuario autor, LocalDateTime creadoEn) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.lugar = lugar;
        this.inicio = inicio;
        this.fin = fin;
        this.recordatorioMinutos = recordatorioMinutos;
        this.autor = autor;
        this.creadoEn = creadoEn;
    }

    public boolean esVisiblePara(Long sectorId) {
        return sectores.isEmpty() || sectores.stream().anyMatch(s -> s.getId().equals(sectorId));
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public TipoEvento getTipo() { return tipo; }
    public void setTipo(TipoEvento tipo) { this.tipo = tipo; }
    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }
    public LocalDateTime getInicio() { return inicio; }
    public void setInicio(LocalDateTime inicio) { this.inicio = inicio; }
    public LocalDateTime getFin() { return fin; }
    public void setFin(LocalDateTime fin) { this.fin = fin; }
    public Integer getRecordatorioMinutos() { return recordatorioMinutos; }
    public void setRecordatorioMinutos(Integer recordatorioMinutos) { this.recordatorioMinutos = recordatorioMinutos; }
    public boolean isRecordatorioEnviado() { return recordatorioEnviado; }
    public void setRecordatorioEnviado(boolean recordatorioEnviado) { this.recordatorioEnviado = recordatorioEnviado; }
    public Usuario getAutor() { return autor; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public Set<Sector> getSectores() { return sectores; }

    public void reemplazarSectores(Set<Sector> nuevos) {
        sectores.clear();
        sectores.addAll(nuevos);
    }
}
