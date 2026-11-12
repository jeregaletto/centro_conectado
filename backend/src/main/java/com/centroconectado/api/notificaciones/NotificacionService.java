package com.centroconectado.api.notificaciones;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.notificaciones.dto.NotificacionDto;
import com.centroconectado.api.usuarios.Usuario;

/**
 * Notificaciones in-app (campanita + contador). El frontend consulta /api/notificaciones/contador
 * cada 60 s. Web Push (VAPID) queda como fase 2 y se engancha acá: este es el único punto de emisión.
 */
@Service
public class NotificacionService {

    private final NotificacionRepository repository;
    private final Clock clock;

    public NotificacionService(NotificacionRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public void notificar(Collection<Usuario> destinatarios, TipoNotificacion tipo, String titulo, String mensaje,
                          String link) {
        LocalDateTime ahora = LocalDateTime.now(clock);
        String tituloCorto = recortar(titulo, 150);
        String mensajeCorto = recortar(mensaje, 1000);
        List<Notificacion> lote = destinatarios.stream()
                .filter(Objects::nonNull)
                .distinct()
                .map(u -> new Notificacion(u, tipo, tituloCorto, mensajeCorto, link, ahora))
                .toList();
        repository.saveAll(lote);
    }

    @Transactional
    public void notificar(Usuario destinatario, TipoNotificacion tipo, String titulo, String mensaje, String link) {
        if (destinatario != null) {
            notificar(List.of(destinatario), tipo, titulo, mensaje, link);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificacionDto> listar(Long usuarioId, boolean soloNoLeidas) {
        List<Notificacion> lista = soloNoLeidas
                ? repository.findTop50ByUsuarioIdAndLeidaFalseOrderByCreadaEnDesc(usuarioId)
                : repository.findTop50ByUsuarioIdOrderByCreadaEnDesc(usuarioId);
        return lista.stream().map(NotificacionDto::de).toList();
    }

    @Transactional(readOnly = true)
    public long noLeidas(Long usuarioId) {
        return repository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    @Transactional
    public NotificacionDto marcarLeida(Long id, Long usuarioId) {
        Notificacion n = repository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificación", id));
        n.setLeida(true);
        return NotificacionDto.de(n);
    }

    @Transactional
    public int marcarTodasLeidas(Long usuarioId) {
        return repository.marcarTodasLeidas(usuarioId);
    }

    private static String recortar(String texto, int max) {
        if (texto == null) {
            return "";
        }
        return texto.length() <= max ? texto : texto.substring(0, max - 1) + "…";
    }
}
