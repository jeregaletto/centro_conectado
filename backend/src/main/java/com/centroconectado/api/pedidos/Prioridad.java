package com.centroconectado.api.pedidos;

public enum Prioridad {
    ALTA(24),
    MEDIA(72),
    BAJA(168);

    /** Plazo por defecto en horas si quien pide no indica uno. */
    private final int horasPlazo;

    Prioridad(int horasPlazo) {
        this.horasPlazo = horasPlazo;
    }

    public int getHorasPlazo() {
        return horasPlazo;
    }
}
