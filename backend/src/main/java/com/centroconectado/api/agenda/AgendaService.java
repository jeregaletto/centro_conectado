package com.centroconectado.api.agenda;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.agenda.dto.EventoDto;
import com.centroconectado.api.agenda.dto.GuardarEventoRequest;
import com.centroconectado.api.common.exception.AccesoDenegadoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.common.exception.ReglaNegocioException;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.notificaciones.TipoNotificacion;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.AlcancePublicacionService;
import com.centroconectado.api.usuarios.AudienciaService;
import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.UsuarioRepository;

@Service
public class AgendaService {

    private static final Logger log = LoggerFactory.getLogger(AgendaService.class);
    private static final DateTimeFormatter ICS_UTC = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final int MAX_DIAS_CONSULTA = 92;

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlcancePublicacionService alcance;
    private final AudienciaService audiencia;
    private final NotificacionService notificaciones;
    private final Clock clock;

    public AgendaService(EventoRepository eventoRepository, UsuarioRepository usuarioRepository,
                         AlcancePublicacionService alcance, AudienciaService audiencia,
                         NotificacionService notificaciones, Clock clock) {
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
        this.alcance = alcance;
        this.audiencia = audiencia;
        this.notificaciones = notificaciones;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<EventoDto> listar(UsuarioAutenticado u, LocalDate desde, LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now(clock);
        LocalDate h = hasta != null ? hasta : d.plusDays(7);
        if (h.isBefore(d)) {
            throw new ReglaNegocioException("'hasta' no puede ser anterior a 'desde'");
        }
        if (h.isAfter(d.plusDays(MAX_DIAS_CONSULTA))) {
            throw new ReglaNegocioException("El rango máximo de consulta es de " + MAX_DIAS_CONSULTA + " días");
        }
        return eventoRepository.findVisiblesEntre(u.sectorId(), d.atStartOfDay(), h.plusDays(1).atStartOfDay())
                .stream().map(EventoDto::de).toList();
    }

    @Transactional(readOnly = true)
    public List<EventoDto> hoy(UsuarioAutenticado u) {
        LocalDate hoy = LocalDate.now(clock);
        return listar(u, hoy, hoy);
    }

    @Transactional(readOnly = true)
    public EventoDto obtener(Long id, UsuarioAutenticado u) {
        return EventoDto.de(visible(id, u));
    }

    @Transactional
    public EventoDto crear(GuardarEventoRequest req, UsuarioAutenticado u) {
        validarFechas(req);
        Evento e = new Evento(req.titulo().trim(), req.descripcion(), req.tipo(), req.lugar(), req.inicio(),
                req.fin(), req.recordatorioMinutos(), usuarioRepository.getReferenceById(u.id()),
                LocalDateTime.now(clock));
        e.reemplazarSectores(alcance.resolver(req.sectorIds(), u));
        return EventoDto.de(eventoRepository.save(e));
    }

    @Transactional
    public EventoDto actualizar(Long id, GuardarEventoRequest req, UsuarioAutenticado u) {
        Evento e = buscar(id);
        validarEdicion(e, u);
        validarFechas(req);
        e.reemplazarSectores(alcance.resolver(req.sectorIds(), u));
        e.setTitulo(req.titulo().trim());
        e.setDescripcion(req.descripcion());
        e.setTipo(req.tipo());
        e.setLugar(req.lugar());
        boolean cambioHorario = !e.getInicio().equals(req.inicio());
        e.setInicio(req.inicio());
        e.setFin(req.fin());
        e.setRecordatorioMinutos(req.recordatorioMinutos());
        if (cambioHorario) {
            e.setRecordatorioEnviado(false);
        }
        return EventoDto.de(e);
    }

    @Transactional
    public void eliminar(Long id, UsuarioAutenticado u) {
        Evento e = buscar(id);
        validarEdicion(e, u);
        eventoRepository.delete(e);
    }

    /** Archivo .ics para "Agregar a mi calendario": recordatorio nativo del celular sin instalar nada. */
    @Transactional(readOnly = true)
    public String ics(Long id, UsuarioAutenticado u) {
        Evento e = visible(id, u);
        ZoneId zona = clock.getZone();
        String inicio = e.getInicio().atZone(zona).withZoneSameInstant(ZoneOffset.UTC).format(ICS_UTC);
        String fin = e.getFin().atZone(zona).withZoneSameInstant(ZoneOffset.UTC).format(ICS_UTC);
        String ahora = LocalDateTime.now(clock).atZone(zona).withZoneSameInstant(ZoneOffset.UTC).format(ICS_UTC);
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n")
                .append("VERSION:2.0\r\n")
                .append("PRODID:-//Centro Conectado//Agenda//ES\r\n")
                .append("BEGIN:VEVENT\r\n")
                .append("UID:evento-").append(e.getId()).append("@centro-conectado\r\n")
                .append("DTSTAMP:").append(ahora).append("\r\n")
                .append("DTSTART:").append(inicio).append("\r\n")
                .append("DTEND:").append(fin).append("\r\n")
                .append("SUMMARY:").append(escaparIcs(e.getTitulo())).append("\r\n");
        if (e.getLugar() != null) {
            sb.append("LOCATION:").append(escaparIcs(e.getLugar())).append("\r\n");
        }
        if (e.getDescripcion() != null) {
            sb.append("DESCRIPTION:").append(escaparIcs(e.getDescripcion())).append("\r\n");
        }
        if (e.getRecordatorioMinutos() != null) {
            sb.append("BEGIN:VALARM\r\n")
                    .append("TRIGGER:-PT").append(e.getRecordatorioMinutos()).append("M\r\n")
                    .append("ACTION:DISPLAY\r\n")
                    .append("DESCRIPTION:").append(escaparIcs(e.getTitulo())).append("\r\n")
                    .append("END:VALARM\r\n");
        }
        sb.append("END:VEVENT\r\n").append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    /** Lo ejecuta el job cada minuto. */
    @Transactional
    public int procesarRecordatorios() {
        LocalDateTime ahora = LocalDateTime.now(clock);
        // Ventana: eventos que empiezan en la próxima semana (máximo recordatorio = 10080 min).
        List<Evento> candidatos = eventoRepository
                .findByRecordatorioEnviadoFalseAndRecordatorioMinutosIsNotNullAndInicioBetween(ahora,
                        ahora.plusDays(7).plusMinutes(1));
        int enviados = 0;
        for (Evento e : candidatos) {
            LocalDateTime momento = e.getInicio().minusMinutes(e.getRecordatorioMinutos());
            if (!ahora.isBefore(momento)) {
                notificaciones.notificar(audiencia.destinatarios(e.getSectores()),
                        TipoNotificacion.RECORDATORIO_EVENTO,
                        "Recordatorio: " + e.getTitulo(),
                        "Empieza a las " + e.getInicio().format(HORA)
                                + (e.getLugar() != null ? " en " + e.getLugar() : ""),
                        "agenda.html?evento=" + e.getId());
                e.setRecordatorioEnviado(true);
                enviados++;
            }
        }
        if (enviados > 0) {
            log.info("Recordatorios de agenda enviados: {}", enviados);
        }
        return enviados;
    }

    private void validarFechas(GuardarEventoRequest req) {
        if (!req.fin().isAfter(req.inicio())) {
            throw new ReglaNegocioException("La hora de fin tiene que ser posterior al inicio");
        }
    }

    private void validarEdicion(Evento e, UsuarioAutenticado u) {
        if (!u.tiene(Permiso.PUBLICAR_GENERAL) && !e.getAutor().getId().equals(u.id())) {
            throw new AccesoDenegadoException("Solo quien creó el evento o Dirección pueden modificarlo");
        }
    }

    private Evento buscar(Long id) {
        return eventoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Evento", id));
    }

    private Evento visible(Long id, UsuarioAutenticado u) {
        Evento e = buscar(id);
        if (!e.esVisiblePara(u.sectorId())) {
            throw new RecursoNoEncontradoException("Evento", id);
        }
        return e;
    }

    private static String escaparIcs(String texto) {
        return texto.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n");
    }
}
