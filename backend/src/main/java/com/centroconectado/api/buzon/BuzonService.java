package com.centroconectado.api.buzon;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.buzon.dto.EnviarMensajeRequest;
import com.centroconectado.api.buzon.dto.MensajeBuzonDto;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.common.exception.ReglaNegocioException;
import com.centroconectado.api.config.AppProperties;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.notificaciones.TipoNotificacion;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.AudienciaService;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;

@Service
public class BuzonService {

    public static final Set<EstadoMensaje> SIN_RESPONDER = EnumSet.of(EstadoMensaje.RECIBIDO, EstadoMensaje.EN_REVISION);

    /** Sin caracteres ambiguos (0/O, 1/I/L) para que se pueda dictar o anotar. */
    private static final char[] ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int LARGO_CODIGO = 10;

    private final MensajeBuzonRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final AudienciaService audiencia;
    private final NotificacionService notificaciones;
    private final Clock clock;
    private final int plazoHoras;
    private final SecureRandom random = new SecureRandom();

    public BuzonService(MensajeBuzonRepository repository, UsuarioRepository usuarioRepository,
                        AudienciaService audiencia, NotificacionService notificaciones, Clock clock,
                        AppProperties props) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.audiencia = audiencia;
        this.notificaciones = notificaciones;
        this.clock = clock;
        this.plazoHoras = props.buzon().plazoRespuestaHoras();
    }

    @Transactional
    public MensajeBuzonDto enviar(EnviarMensajeRequest req, UsuarioAutenticado u) {
        Usuario autor = usuarioRepository.findById(u.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", u.id()));
        LocalDateTime ahora = LocalDateTime.now(clock);
        MensajeBuzon m = new MensajeBuzon(generarCodigo(), req.tipo(), req.asunto().trim(), req.cuerpo().trim(),
                req.anonimo(), autor, autor.getSector(), ahora.plusHours(plazoHoras), ahora);
        repository.save(m);
        notificaciones.notificar(audiencia.gestoresGenerales(), TipoNotificacion.BUZON_NUEVO,
                "Buzón: nueva " + req.tipo().name().toLowerCase(Locale.ROOT),
                m.getAsunto() + " · Responder antes de " + plazoHoras + " h",
                "buzon.html?gestion=" + m.getId());
        return toDto(m, false);
    }

    @Transactional(readOnly = true)
    public List<MensajeBuzonDto> mios(UsuarioAutenticado u) {
        return repository.findByAutorIdOrderByCreadoEnDesc(u.id()).stream().map(m -> toDto(m, false)).toList();
    }

    /** Seguimiento de un mensaje (sobre todo anónimo) por su código. */
    @Transactional(readOnly = true)
    public MensajeBuzonDto seguimiento(String codigo) {
        String normalizado = codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
        return repository.findByCodigoSeguimiento(normalizado)
                .map(m -> toDto(m, false))
                .orElseThrow(() -> new RecursoNoEncontradoException("No encontramos un mensaje con ese código"));
    }

    @Transactional(readOnly = true)
    public List<MensajeBuzonDto> gestion(EstadoMensaje estado) {
        return repository.findAllByOrderByCreadoEnDesc().stream()
                .filter(m -> estado == null || m.getEstado() == estado)
                .map(m -> toDto(m, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public long sinResponder() {
        return repository.countByEstadoIn(SIN_RESPONDER);
    }

    @Transactional(readOnly = true)
    public long vencidos() {
        LocalDateTime ahora = LocalDateTime.now(clock);
        return repository.findByEstadoIn(SIN_RESPONDER).stream().filter(m -> m.estaVencido(ahora)).count();
    }

    @Transactional
    public MensajeBuzonDto responder(Long id, String respuesta, UsuarioAutenticado u) {
        MensajeBuzon m = buscar(id);
        if (m.getEstado() == EstadoMensaje.CERRADO) {
            throw new ReglaNegocioException("El mensaje está cerrado");
        }
        m.responder(respuesta.trim(), usuarioRepository.getReferenceById(u.id()), LocalDateTime.now(clock));
        if (m.getAutor() != null) {
            notificaciones.notificar(m.getAutor(), TipoNotificacion.BUZON_RESPONDIDO,
                    "Respondieron tu " + m.getTipo().name().toLowerCase(Locale.ROOT), m.getAsunto(),
                    "buzon.html?codigo=" + m.getCodigoSeguimiento());
        }
        return toDto(m, true);
    }

    @Transactional
    public MensajeBuzonDto cambiarEstado(Long id, EstadoMensaje estado) {
        MensajeBuzon m = buscar(id);
        if (estado == EstadoMensaje.RESPONDIDO) {
            throw new ReglaNegocioException("Para marcarlo como respondido usá 'responder'");
        }
        m.setEstado(estado);
        return toDto(m, true);
    }

    private String generarCodigo() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder(LARGO_CODIGO);
            for (int i = 0; i < LARGO_CODIGO; i++) {
                sb.append(ALFABETO[random.nextInt(ALFABETO.length)]);
            }
            codigo = sb.toString();
        } while (repository.existsByCodigoSeguimiento(codigo));
        return codigo;
    }

    private MensajeBuzon buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Mensaje", id));
    }

    private MensajeBuzonDto toDto(MensajeBuzon m, boolean vistaGestion) {
        boolean mostrarAutor = vistaGestion && !m.isAnonimo() && m.getAutor() != null;
        return new MensajeBuzonDto(m.getId(), m.getCodigoSeguimiento(), m.getTipo(), m.getAsunto(), m.getCuerpo(),
                m.isAnonimo(),
                mostrarAutor ? m.getAutor().getNombreCompleto() : null,
                mostrarAutor && m.getSector() != null ? m.getSector().getNombre() : null,
                m.getEstado(), m.getCreadoEn(), m.getPlazoRespuesta(), m.estaVencido(LocalDateTime.now(clock)),
                m.getRespuesta(), m.getRespondidoEn());
    }
}
