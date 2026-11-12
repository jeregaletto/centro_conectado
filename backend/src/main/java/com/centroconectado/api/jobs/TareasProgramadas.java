package com.centroconectado.api.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.centroconectado.api.agenda.AgendaService;
import com.centroconectado.api.inicio.ResumenSemanalService;

@Component
public class TareasProgramadas {

    private static final Logger log = LoggerFactory.getLogger(TareasProgramadas.class);

    private final AgendaService agendaService;
    private final VencimientosService vencimientosService;
    private final ResumenSemanalService resumenSemanalService;

    public TareasProgramadas(AgendaService agendaService, VencimientosService vencimientosService,
                             ResumenSemanalService resumenSemanalService) {
        this.agendaService = agendaService;
        this.vencimientosService = vencimientosService;
        this.resumenSemanalService = resumenSemanalService;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void recordatoriosDeAgenda() {
        ejecutar("recordatorios", agendaService::procesarRecordatorios);
    }

    @Scheduled(cron = "0 0 7 * * *", zone = "${app.zona-horaria}")
    public void controlDeVencimientos() {
        ejecutar("vencimientos", vencimientosService::procesar);
    }

    /** Lunes 8:00, hora argentina. */
    @Scheduled(cron = "0 0 8 * * MON", zone = "${app.zona-horaria}")
    public void resumenSemanal() {
        ejecutar("resumen semanal", resumenSemanalService::enviarATodos);
    }

    private void ejecutar(String nombre, Runnable tarea) {
        try {
            tarea.run();
        } catch (RuntimeException ex) {
            // Un job que falla no debe matar al scheduler ni a los demás jobs.
            log.error("Falló la tarea programada '{}'", nombre, ex);
        }
    }
}
