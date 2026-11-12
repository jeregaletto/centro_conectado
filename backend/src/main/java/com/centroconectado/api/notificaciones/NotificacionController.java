package com.centroconectado.api.notificaciones;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.centroconectado.api.notificaciones.dto.ContadorDto;
import com.centroconectado.api.notificaciones.dto.NotificacionDto;
import com.centroconectado.api.security.UsuarioAutenticado;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @GetMapping
    public List<NotificacionDto> listar(@AuthenticationPrincipal UsuarioAutenticado u,
                                        @RequestParam(defaultValue = "false") boolean soloNoLeidas) {
        return service.listar(u.id(), soloNoLeidas);
    }

    @GetMapping("/contador")
    public ContadorDto contador(@AuthenticationPrincipal UsuarioAutenticado u) {
        return new ContadorDto(service.noLeidas(u.id()));
    }

    @PostMapping("/{id}/leida")
    public NotificacionDto marcarLeida(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado u) {
        return service.marcarLeida(id, u.id());
    }

    @PostMapping("/leer-todas")
    public Map<String, Integer> leerTodas(@AuthenticationPrincipal UsuarioAutenticado u) {
        return Map.of("actualizadas", service.marcarTodasLeidas(u.id()));
    }
}
