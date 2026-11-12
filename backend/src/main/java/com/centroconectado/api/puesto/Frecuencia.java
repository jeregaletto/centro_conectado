package com.centroconectado.api.puesto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

public enum Frecuencia {
    DIARIA,
    SEMANAL;

    /** Período al que pertenece un tilde: el día, o el lunes de esa semana. */
    public LocalDate periodo(LocalDate fecha) {
        return this == DIARIA ? fecha : fecha.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
