package com.centroconectado.api.puesto;

import java.time.LocalDate;
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

/** Un tilde: "esta persona hizo esta tarea en este período". */
@Entity
@Table(name = "tareas_registro")
public class TareaRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tarea_id", nullable = false)
    private TareaPuesto tarea;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDate periodo;

    @Column(name = "completada_en", nullable = false)
    private LocalDateTime completadaEn;

    protected TareaRegistro() {
    }

    public TareaRegistro(TareaPuesto tarea, Usuario usuario, LocalDate periodo, LocalDateTime completadaEn) {
        this.tarea = tarea;
        this.usuario = usuario;
        this.periodo = periodo;
        this.completadaEn = completadaEn;
    }

    public Long getId() { return id; }
    public TareaPuesto getTarea() { return tarea; }
    public Usuario getUsuario() { return usuario; }
    public LocalDate getPeriodo() { return periodo; }
    public LocalDateTime getCompletadaEn() { return completadaEn; }
}
