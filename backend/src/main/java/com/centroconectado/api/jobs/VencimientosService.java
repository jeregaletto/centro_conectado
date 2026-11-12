package com.centroconectado.api.jobs;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.avisos.Aviso;
import com.centroconectado.api.avisos.AvisoRepository;
import com.centroconectado.api.biblioteca.Documento;
import com.centroconectado.api.biblioteca.DocumentoRepository;
import com.centroconectado.api.buzon.BuzonService;
import com.centroconectado.api.common.VigenciaPolicy;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.notificaciones.TipoNotificacion;
import com.centroconectado.api.usuarios.AudienciaService;

/** Avisa a quien publicó que su contenido está por vencer, y a Dirección si hay buzón fuera de plazo. */
@Service
public class VencimientosService {

    private static final Logger log = LoggerFactory.getLogger(VencimientosService.class);
    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM");

    private final AvisoRepository avisoRepository;
    private final DocumentoRepository documentoRepository;
    private final BuzonService buzonService;
    private final AudienciaService audiencia;
    private final NotificacionService notificaciones;
    private final VigenciaPolicy vigencia;
    private final Clock clock;

    public VencimientosService(AvisoRepository avisoRepository, DocumentoRepository documentoRepository,
                               BuzonService buzonService, AudienciaService audiencia,
                               NotificacionService notificaciones, VigenciaPolicy vigencia, Clock clock) {
        this.avisoRepository = avisoRepository;
        this.documentoRepository = documentoRepository;
        this.buzonService = buzonService;
        this.audiencia = audiencia;
        this.notificaciones = notificaciones;
        this.vigencia = vigencia;
        this.clock = clock;
    }

    @Transactional
    public void procesar() {
        LocalDateTime ahora = LocalDateTime.now(clock);
        LocalDateTime limite = ahora.plusDays(vigencia.getAvisoVencimientoDias());

        for (Aviso a : avisoRepository.findByActivoTrueAndVigenteHastaBetweenOrderByVigenteHastaAsc(ahora, limite)) {
            notificaciones.notificar(a.getAutor(), TipoNotificacion.CONTENIDO_POR_VENCER,
                    "Tu aviso vence el " + a.getVigenteHasta().format(FECHA),
                    "\"" + a.getTitulo() + "\" deja de verse si no lo renovás.",
                    "/publicar?tipo=publicados");
        }
        for (Documento d : documentoRepository.findByActivoTrueAndVigenteHastaBetweenOrderByVigenteHastaAsc(ahora, limite)) {
            notificaciones.notificar(d.getPublicadoPor(), TipoNotificacion.CONTENIDO_POR_VENCER,
                    "Documento por vencer el " + d.getVigenteHasta().format(FECHA),
                    "\"" + d.getTitulo() + "\" deja de verse en la Biblioteca si no se revisa y renueva.",
                    "/biblioteca?id=" + d.getId());
        }
        long buzonVencido = buzonService.vencidos();
        if (buzonVencido > 0) {
            notificaciones.notificar(audiencia.gestoresGenerales(), TipoNotificacion.BUZON_NUEVO,
                    "Buzón fuera de plazo",
                    buzonVencido + " mensajes superaron el plazo de respuesta.",
                    "/gestion?seccion=buzon");
        }
        log.info("Control de vencimientos ejecutado");
    }
}
