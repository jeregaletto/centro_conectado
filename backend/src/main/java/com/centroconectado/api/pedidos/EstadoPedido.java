package com.centroconectado.api.pedidos;

import java.util.EnumSet;
import java.util.Set;

public enum EstadoPedido {
    PENDIENTE,
    EN_CURSO,
    RESUELTO,
    RECHAZADO,
    CANCELADO;

    public static final Set<EstadoPedido> ABIERTOS = EnumSet.of(PENDIENTE, EN_CURSO);

    public boolean esTerminal() {
        return !ABIERTOS.contains(this);
    }

    public boolean puedePasarA(EstadoPedido nuevo) {
        return switch (this) {
            case PENDIENTE -> nuevo == EN_CURSO || nuevo == RESUELTO || nuevo == RECHAZADO || nuevo == CANCELADO;
            case EN_CURSO -> nuevo == RESUELTO || nuevo == RECHAZADO || nuevo == CANCELADO;
            case RESUELTO, RECHAZADO, CANCELADO -> false;
        };
    }
}
