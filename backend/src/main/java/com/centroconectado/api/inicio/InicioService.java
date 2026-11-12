package com.centroconectado.api.inicio;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.agenda.AgendaService;
import com.centroconectado.api.avisos.AvisoService;
import com.centroconectado.api.avisos.dto.AvisoDto;
import com.centroconectado.api.common.exception.NoAutenticadoException;
import com.centroconectado.api.inicio.dto.InicioDto;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.pedidos.PedidoService;
import com.centroconectado.api.puesto.MiPuestoService;
import com.centroconectado.api.puesto.dto.AvanceDto;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;

@Service
public class InicioService {

    private static final int MAX_NOVEDADES = 10;

    private final UsuarioRepository usuarioRepository;
    private final AvisoService avisoService;
    private final AgendaService agendaService;
    private final NotificacionService notificacionService;
    private final PedidoService pedidoService;
    private final MiPuestoService miPuestoService;
    private final Clock clock;

    public InicioService(UsuarioRepository usuarioRepository, AvisoService avisoService, AgendaService agendaService,
                         NotificacionService notificacionService, PedidoService pedidoService,
                         MiPuestoService miPuestoService, Clock clock) {
        this.usuarioRepository = usuarioRepository;
        this.avisoService = avisoService;
        this.agendaService = agendaService;
        this.notificacionService = notificacionService;
        this.pedidoService = pedidoService;
        this.miPuestoService = miPuestoService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public InicioDto inicio(UsuarioAutenticado u) {
        Usuario usuario = usuarioRepository.findById(u.id())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new NoAutenticadoException("Tu usuario ya no está activo"));
        LocalDateTime ahora = LocalDateTime.now(clock);

        List<AvisoDto> avisos = avisoService.listar(u, null, false);
        List<AvisoDto> fijados = avisos.stream()
                .filter(a -> a.fijado() || (a.requiereLectura() && !a.leido()))
                .toList();
        List<AvisoDto> novedades = avisos.stream()
                .filter(a -> !fijados.contains(a))
                .limit(MAX_NOVEDADES)
                .toList();

        AvanceDto tareas = miPuestoService.avanceDeHoy(u);

        return new InicioDto(ahora.toLocalDate(), saludo(ahora), usuario.getNombre(), usuario.getRol().getEtiqueta(),
                usuario.getRol().getVista(), fijados, novedades, agendaService.hoy(u),
                notificacionService.noLeidas(u.id()), pedidoService.pendientesRecibidos(u.sectorId()),
                tareas.total() == 0 ? null : tareas);
    }

    private static String saludo(LocalDateTime ahora) {
        int hora = ahora.getHour();
        if (hora >= 6 && hora < 13) {
            return "Buen día";
        }
        if (hora >= 13 && hora < 20) {
            return "Buenas tardes";
        }
        return "Buenas noches";
    }
}
