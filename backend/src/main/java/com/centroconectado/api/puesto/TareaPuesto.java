package com.centroconectado.api.puesto;

import com.centroconectado.api.usuarios.Sector;

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

/** Plantilla de tarea/responsabilidad de un sector (y opcionalmente de un puesto puntual). */
@Entity
@Table(name = "tareas_puesto")
public class TareaPuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    /** Null = aplica a todo el sector. */
    @Column(length = 80)
    private String puesto;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    /** Clave de ícono que resuelve el frontend (ej: "trapeador", "basura", "banio"). */
    @Column(nullable = false, length = 40)
    private String icono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Frecuencia frecuencia;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private boolean activa = true;

    protected TareaPuesto() {
    }

    public TareaPuesto(Sector sector, String puesto, String titulo, String descripcion, String icono,
                       Frecuencia frecuencia, int orden) {
        this.sector = sector;
        this.puesto = puesto;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.icono = icono;
        this.frecuencia = frecuencia;
        this.orden = orden;
    }

    public boolean aplicaA(Long sectorId, String puestoUsuario) {
        return activa && sector.getId().equals(sectorId)
                && (puesto == null || puesto.equalsIgnoreCase(puestoUsuario));
    }

    public Long getId() { return id; }
    public Sector getSector() { return sector; }
    public void setSector(Sector sector) { this.sector = sector; }
    public String getPuesto() { return puesto; }
    public void setPuesto(String puesto) { this.puesto = puesto; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }
    public Frecuencia getFrecuencia() { return frecuencia; }
    public void setFrecuencia(Frecuencia frecuencia) { this.frecuencia = frecuencia; }
    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }
    public boolean isActiva() { return activa; }
    public void setActiva(boolean activa) { this.activa = activa; }
}
