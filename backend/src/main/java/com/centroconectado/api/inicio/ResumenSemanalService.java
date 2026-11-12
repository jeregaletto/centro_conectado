package com.centroconectado.api.inicio;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.agenda.AgendaService;
import com.centroconectado.api.agenda.dto.EventoDto;
import com.centroconectado.api.avisos.AvisoService;
import com.centroconectado.api.avisos.dto.AvisoDto;
import com.centroconectado.api.buzon.BuzonService;
import com.centroconectado.api.inicio.dto.ResumenSemanalDto;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.notificaciones.TipoNotificacion;
import com.centroconectado.api.pedidos.PedidoService;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;

/** "Un resumen semanal los lunes": se arma por usuario y se entrega como notificación. */
@Service
public class ResumenSemanalService {

    private static final Logger log = LoggerFactory.getLogger(ResumenSemanalService.class);

    private final AvisoService avisoService;
    private final AgendaService agendaService;
    private final PedidoService pedidoService;
    private final BuzonService buzonService;
    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;

    public ResumenSemanalService(AvisoService avisoService, AgendaService agendaService, PedidoService pedidoService,
                                 BuzonService buzonService, NotificacionService notificacionService,
                                 UsuarioRepository usuarioRepository, Clock clock) {
        this.avisoService = avisoService;
        this.agendaService = agendaService;
        this.pedidoService = pedidoService;
        this.buzonService = buzonService;
        this.notificacionService = notificacionService;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ResumenSemanalDto resumen(UsuarioAutenticado u) {
        LocalDate hoy = LocalDate.now(clock);
        LocalDate lunes = hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate domingo = lunes.plusDays(6);
        LocalDateTime haceUnaSemana = LocalDateTime.now(clock).minusDays(7);

        List<AvisoDto> nuevos = avisoService.listar(u, null, false).stream()
                .filter(a -> a.publicadoEn().isAfter(haceUnaSemana))
                .toList();
        List<String> destacados = nuevos.stream()
                .sorted((a, b) -> Boolean.compare(b.fijado() || b.requiereLectura(), a.fijado() || a.requiereLectura()))
                .limit(5)
                .map(AvisoDto::titulo)
                .toList();
        List<EventoDto> agenda = agendaService.listar(u, lunes, domingo);
        Long buzon = u.tiene(Permiso.GESTIONAR_BUZON) ? buzonService.sinResponder() : null;

        return new ResumenSemanalDto(lunes, domingo, nuevos.size(), destacados, agenda,
                pedidoService.pendientesRecibidos(u.sectorId()), pedidoService.vencidosRecibidos(u.sectorId()), buzon);
    }

    @Transactional
    public int enviarATodos() {
        List<Usuario> usuarios = usuarioRepository.findByActivoTrue();
        int enviados = 0;
        for (Usuario usuario : usuarios) {
            ResumenSemanalDto r = resumen(UsuarioAutenticado.de(usuario));
            StringBuilder msg = new StringBuilder()
                    .append(r.avisosNuevos()).append(" avisos nuevos · ")
                    .append(r.agendaSemana().size()).append(" eventos esta semana · ")
                    .append(r.pedidosPendientes()).append(" pedidos pendientes en tu área");
            if (r.pedidosVencidos() > 0) {
                msg.append(" (").append(r.pedidosVencidos()).append(" vencidos)");
            }
            if (r.buzonSinResponder() != null && r.buzonSinResponder() > 0) {
                msg.append(" · ").append(r.buzonSinResponder()).append(" mensajes del buzón sin responder");
            }
            notificacionService.notificar(usuario, TipoNotificacion.RESUMEN_SEMANAL, "Resumen de la semana",
                    msg.toString(), "/inicio");
            enviados++;
        }
        log.info("Resumen semanal enviado a {} usuarios", enviados);
        return enviados;
    }
}
