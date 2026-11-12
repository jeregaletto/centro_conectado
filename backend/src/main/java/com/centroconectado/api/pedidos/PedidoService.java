package com.centroconectado.api.pedidos;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.common.exception.AccesoDenegadoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.common.exception.ReglaNegocioException;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.notificaciones.TipoNotificacion;
import com.centroconectado.api.pedidos.dto.CambiarEstadoPedidoRequest;
import com.centroconectado.api.pedidos.dto.CrearPedidoRequest;
import com.centroconectado.api.pedidos.dto.MovimientoDto;
import com.centroconectado.api.pedidos.dto.PedidoDetalleDto;
import com.centroconectado.api.pedidos.dto.PedidoDto;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.Sector;
import com.centroconectado.api.usuarios.SectorRepository;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;
import com.centroconectado.api.usuarios.dto.SectorResumenDto;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMovimientoRepository movimientoRepository;
    private final SectorRepository sectorRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificaciones;
    private final Clock clock;

    public PedidoService(PedidoRepository pedidoRepository, PedidoMovimientoRepository movimientoRepository,
                         SectorRepository sectorRepository, UsuarioRepository usuarioRepository,
                         NotificacionService notificaciones, Clock clock) {
        this.pedidoRepository = pedidoRepository;
        this.movimientoRepository = movimientoRepository;
        this.sectorRepository = sectorRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificaciones = notificaciones;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<PedidoDto> recibidos(UsuarioAutenticado u, EstadoPedido estado) {
        return filtrar(pedidoRepository.findTop100BySectorDestinoIdOrderByCreadoEnDesc(u.sectorId()), estado);
    }

    @Transactional(readOnly = true)
    public List<PedidoDto> enviados(UsuarioAutenticado u, EstadoPedido estado) {
        return filtrar(pedidoRepository.findTop100BySectorOrigenIdOrderByCreadoEnDesc(u.sectorId()), estado);
    }

    /** Tablero de Dirección: todos los pedidos, para detectar cuellos de botella entre servicios. */
    @Transactional(readOnly = true)
    public List<PedidoDto> todos(EstadoPedido estado) {
        return filtrar(pedidoRepository.findTop200ByOrderByCreadoEnDesc(), estado);
    }

    @Transactional(readOnly = true)
    public long pendientesRecibidos(Long sectorId) {
        return pedidoRepository.countBySectorDestinoIdAndEstadoIn(sectorId, EstadoPedido.ABIERTOS);
    }

    @Transactional(readOnly = true)
    public long vencidosRecibidos(Long sectorId) {
        LocalDateTime ahora = ahora();
        return pedidoRepository.findBySectorDestinoIdAndEstadoIn(sectorId, EstadoPedido.ABIERTOS).stream()
                .filter(p -> p.estaVencido(ahora))
                .count();
    }

    @Transactional(readOnly = true)
    public PedidoDetalleDto detalle(Long id, UsuarioAutenticado u) {
        Pedido p = accesible(id, u);
        return toDetalle(p, u);
    }

    @Transactional
    public PedidoDetalleDto crear(CrearPedidoRequest req, UsuarioAutenticado u) {
        Usuario creador = usuario(u.id());
        Sector origen = creador.getSector();
        Sector destino = sectorRepository.findById(req.sectorDestinoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Sector", req.sectorDestinoId()));
        if (destino.getId().equals(origen.getId())) {
            throw new ReglaNegocioException("El pedido tiene que ir a otra área");
        }
        Usuario asignado = null;
        if (req.asignadoAId() != null) {
            asignado = usuario(req.asignadoAId());
            if (!asignado.getSector().getId().equals(destino.getId())) {
                throw new ReglaNegocioException("La persona asignada tiene que pertenecer al área destino");
            }
        }
        Prioridad prioridad = req.prioridad() != null ? req.prioridad() : Prioridad.MEDIA;
        LocalDateTime ahora = ahora();
        LocalDateTime plazo = req.plazo() != null ? req.plazo() : ahora.plusHours(prioridad.getHorasPlazo());
        if (!plazo.isAfter(ahora)) {
            throw new ReglaNegocioException("El plazo tiene que ser futuro");
        }

        Pedido p = new Pedido(req.tipo(), req.asunto().trim(), req.detalle().trim(), prioridad, origen, destino,
                creador, asignado, plazo, ahora);
        pedidoRepository.save(p);
        p.setCodigo(String.format("%s-%06d", req.tipo() == TipoPedido.INTERCONSULTA ? "INT" : "PED", p.getId()));
        movimientoRepository.save(new PedidoMovimiento(p, creador, null, EstadoPedido.PENDIENTE, "Pedido creado", ahora));

        List<Usuario> avisar = asignado != null
                ? List.of(asignado)
                : usuarioRepository.findByActivoTrueAndSectorId(destino.getId());
        notificaciones.notificar(avisar, TipoNotificacion.PEDIDO_NUEVO,
                "Nuevo " + (req.tipo() == TipoPedido.INTERCONSULTA ? "interconsulta" : "pedido") + " de "
                        + origen.getNombre(),
                p.getAsunto() + " · Prioridad " + prioridad.name().toLowerCase(),
                "/pedidos/" + p.getId());
        return toDetalle(p, u);
    }

    @Transactional
    public PedidoDetalleDto cambiarEstado(Long id, CambiarEstadoPedidoRequest req, UsuarioAutenticado u) {
        Pedido p = accesible(id, u);
        EstadoPedido nuevo = req.estado();
        boolean esDestino = p.getSectorDestino().getId().equals(u.sectorId());
        boolean esOrigen = p.getSectorOrigen().getId().equals(u.sectorId());

        if (nuevo == EstadoPedido.CANCELADO) {
            if (!esOrigen) {
                throw new AccesoDenegadoException("Solo el área que hizo el pedido puede cancelarlo");
            }
        } else if (!esDestino) {
            throw new AccesoDenegadoException("Solo el área que recibe el pedido puede cambiar su estado");
        }
        if (!p.getEstado().puedePasarA(nuevo)) {
            throw new ReglaNegocioException("No se puede pasar de " + p.getEstado() + " a " + nuevo);
        }
        if (nuevo == EstadoPedido.RECHAZADO && (req.comentario() == null || req.comentario().isBlank())) {
            throw new ReglaNegocioException("Para rechazar un pedido indicá el motivo");
        }

        Usuario actor = usuario(u.id());
        EstadoPedido anterior = p.getEstado();
        LocalDateTime ahora = ahora();
        p.cambiarEstado(nuevo, ahora);
        if (nuevo == EstadoPedido.EN_CURSO && p.getAsignadoA() == null) {
            p.setAsignadoA(actor);
        }
        movimientoRepository.save(new PedidoMovimiento(p, actor, anterior, nuevo, req.comentario(), ahora));

        Usuario aNotificar = esDestino ? p.getCreadoPor() : p.getAsignadoA();
        notificaciones.notificar(aNotificar, TipoNotificacion.PEDIDO_ACTUALIZADO,
                p.getCodigo() + ": " + etiqueta(nuevo),
                p.getAsunto() + (req.comentario() != null && !req.comentario().isBlank()
                        ? " · " + req.comentario() : ""),
                "/pedidos/" + p.getId());
        return toDetalle(p, u);
    }

    @Transactional
    public PedidoDetalleDto comentar(Long id, String comentario, UsuarioAutenticado u) {
        Pedido p = accesible(id, u);
        Usuario actor = usuario(u.id());
        LocalDateTime ahora = ahora();
        movimientoRepository.save(new PedidoMovimiento(p, actor, null, null, comentario.trim(), ahora));
        p.tocar(ahora);

        Usuario aNotificar;
        if (!p.getCreadoPor().getId().equals(actor.getId())) {
            aNotificar = p.getCreadoPor();
        } else if (p.getAsignadoA() != null) {
            aNotificar = p.getAsignadoA();
        } else {
            aNotificar = p.getSectorDestino().getReferente();
        }
        notificaciones.notificar(aNotificar, TipoNotificacion.PEDIDO_ACTUALIZADO,
                p.getCodigo() + ": nuevo comentario", actor.getNombreCompleto() + ": " + comentario.trim(),
                "/pedidos/" + p.getId());
        return toDetalle(p, u);
    }

    private Pedido accesible(Long id, UsuarioAutenticado u) {
        Pedido p = pedidoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Pedido", id));
        if (!p.involucraSector(u.sectorId()) && !u.tiene(Permiso.VER_TODOS_LOS_PEDIDOS)) {
            // 404 y no 403: no revelamos que el pedido existe.
            throw new RecursoNoEncontradoException("Pedido", id);
        }
        return p;
    }

    private List<PedidoDto> filtrar(List<Pedido> pedidos, EstadoPedido estado) {
        LocalDateTime ahora = ahora();
        return pedidos.stream()
                .filter(p -> estado == null || p.getEstado() == estado)
                .map(p -> toDto(p, ahora))
                .toList();
    }

    private PedidoDetalleDto toDetalle(Pedido p, UsuarioAutenticado u) {
        List<MovimientoDto> historial = movimientoRepository.findByPedidoIdOrderByCreadoEnAsc(p.getId()).stream()
                .map(m -> new MovimientoDto(m.getId(), m.getUsuario().getNombreCompleto(), m.getEstadoAnterior(),
                        m.getEstadoNuevo(), m.getComentario(), m.getCreadoEn()))
                .toList();
        boolean abierto = !p.getEstado().esTerminal();
        boolean puedeCambiar = abierto && p.getSectorDestino().getId().equals(u.sectorId());
        boolean puedeCancelar = abierto && p.getSectorOrigen().getId().equals(u.sectorId());
        return new PedidoDetalleDto(toDto(p, ahora()), historial, puedeCambiar, puedeCancelar);
    }

    private PedidoDto toDto(Pedido p, LocalDateTime ahora) {
        Long horasRestantes = p.getEstado().esTerminal() ? null : Duration.between(ahora, p.getPlazo()).toHours();
        return new PedidoDto(p.getId(), p.getCodigo(), p.getTipo(), p.getAsunto(), p.getDetalle(), p.getPrioridad(),
                p.getEstado(), SectorResumenDto.de(p.getSectorOrigen()), SectorResumenDto.de(p.getSectorDestino()),
                p.getCreadoPor().getNombreCompleto(),
                p.getAsignadoA() != null ? p.getAsignadoA().getNombreCompleto() : null,
                p.getPlazo(), p.estaVencido(ahora), horasRestantes, p.getCreadoEn(), p.getActualizadoEn(),
                p.getCerradoEn());
    }

    private static String etiqueta(EstadoPedido e) {
        return switch (e) {
            case PENDIENTE -> "pendiente";
            case EN_CURSO -> "en curso";
            case RESUELTO -> "resuelto";
            case RECHAZADO -> "rechazado";
            case CANCELADO -> "cancelado";
        };
    }

    private Usuario usuario(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(clock);
    }
}
