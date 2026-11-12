package com.centroconectado.api.notificaciones.dto;

import java.time.LocalDateTime;

import com.centroconectado.api.notificaciones.Notificacion;
import com.centroconectado.api.notificaciones.TipoNotificacion;

public record NotificacionDto(Long id, TipoNotificacion tipo, String titulo, String mensaje, String link,
                              boolean leida, LocalDateTime creadaEn) {

    public static NotificacionDto de(Notificacion n) {
        return new NotificacionDto(n.getId(), n.getTipo(), n.getTitulo(), n.getMensaje(), n.getLink(), n.isLeida(),
                n.getCreadaEn());
    }
}
