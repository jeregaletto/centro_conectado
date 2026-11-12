package com.centroconectado.api.avisos;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.avisos.dto.AvisoDto;
import com.centroconectado.api.avisos.dto.GuardarAvisoRequest;
import com.centroconectado.api.avisos.dto.LecturasDto;
import com.centroconectado.api.common.VigenciaPolicy;
import com.centroconectado.api.common.exception.AccesoDenegadoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.notificaciones.NotificacionService;
import com.centroconectado.api.notificaciones.TipoNotificacion;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.AlcancePublicacionService;
import com.centroconectado.api.usuarios.AudienciaService;
import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.Sector;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;
import com.centroconectado.api.usuarios.dto.ContactoDto;

@Service
public class AvisoService {

    private final AvisoRepository avisoRepository;
    private final LecturaAvisoRepository lecturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlcancePublicacionService alcance;
    private final AudienciaService audiencia;
    private final NotificacionService notificaciones;
    private final VigenciaPolicy vigencia;
    private final Clock clock;

    public AvisoService(AvisoRepository avisoRepository, LecturaAvisoRepository lecturaRepository,
                        UsuarioRepository usuarioRepository, AlcancePublicacionService alcance,
                        AudienciaService audiencia, NotificacionService notificaciones, VigenciaPolicy vigencia,
                        Clock clock) {
        this.avisoRepository = avisoRepository;
        this.lecturaRepository = lecturaRepository;
        this.usuarioRepository = usuarioRepository;
        this.alcance = alcance;
        this.audiencia = audiencia;
        this.notificaciones = notificaciones;
        this.vigencia = vigencia;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<AvisoDto> listar(UsuarioAutenticado u, TipoAviso tipo, boolean soloNoLeidos) {
        List<Aviso> avisos = avisoRepository.findVisibles(u.sectorId(), ahora());
        Set<Long> leidos = avisos.isEmpty()
                ? Set.of()
                : lecturaRepository.findAvisoIdsLeidos(u.id(), avisos.stream().map(Aviso::getId).toList());
        return avisos.stream()
                .filter(a -> tipo == null || a.getTipo() == tipo)
                .filter(a -> !soloNoLeidos || !leidos.contains(a.getId()))
                .map(a -> toDto(a, leidos.contains(a.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AvisoDto obtener(Long id, UsuarioAutenticado u) {
        Aviso a = visible(id, u);
        return toDto(a, lecturaRepository.existsByAvisoIdAndUsuarioId(id, u.id()));
    }

    @Transactional
    public AvisoDto crear(GuardarAvisoRequest req, UsuarioAutenticado u) {
        Set<Sector> sectores = alcance.resolver(req.sectorIds(), u);
        Usuario autor = usuarioRepository.getReferenceById(u.id());
        Aviso a = new Aviso(req.titulo().trim(), req.cuerpo().trim(), req.tipo(), req.fijado(),
                req.requiereLectura(), autor, ahora(), vigencia.resolver(req.vigenteHasta()));
        a.reemplazarSectores(sectores);
        avisoRepository.save(a);
        notificarSiCorresponde(a, u.id());
        return toDto(a, false);
    }

    @Transactional
    public AvisoDto actualizar(Long id, GuardarAvisoRequest req, UsuarioAutenticado u) {
        Aviso a = buscar(id);
        validarEdicion(a, u);
        a.reemplazarSectores(alcance.resolver(req.sectorIds(), u));
        a.setTitulo(req.titulo().trim());
        a.setCuerpo(req.cuerpo().trim());
        a.setTipo(req.tipo());
        a.setFijado(req.fijado());
        a.setRequiereLectura(req.requiereLectura());
        a.setVigenteHasta(vigencia.resolver(req.vigenteHasta()));
        return toDto(a, lecturaRepository.existsByAvisoIdAndUsuarioId(id, u.id()));
    }

    @Transactional
    public AvisoDto marcarLeido(Long id, UsuarioAutenticado u) {
        Aviso a = visible(id, u);
        if (!lecturaRepository.existsByAvisoIdAndUsuarioId(id, u.id())) {
            lecturaRepository.save(new LecturaAviso(a, usuarioRepository.getReferenceById(u.id()), ahora()));
        }
        return toDto(a, true);
    }

    @Transactional
    public AvisoDto renovar(Long id, LocalDateTime nuevaVigencia, UsuarioAutenticado u) {
        Aviso a = buscar(id);
        validarEdicion(a, u);
        a.setVigenteHasta(vigencia.resolver(nuevaVigencia));
        a.setActivo(true);
        return toDto(a, lecturaRepository.existsByAvisoIdAndUsuarioId(id, u.id()));
    }

    @Transactional
    public void eliminar(Long id, UsuarioAutenticado u) {
        Aviso a = buscar(id);
        validarEdicion(a, u);
        a.setActivo(false);
    }

    @Transactional(readOnly = true)
    public LecturasDto lecturas(Long id, UsuarioAutenticado u) {
        Aviso a = buscar(id);
        if (!u.tiene(Permiso.PUBLICAR_GENERAL) && !a.getAutor().getId().equals(u.id())) {
            throw new AccesoDenegadoException("Solo quien publicó el aviso o Dirección pueden ver las lecturas");
        }
        List<Usuario> destinatarios = audiencia.destinatarios(a.getSectores());
        Set<Long> leyeron = lecturaRepository.findUsuarioIdsByAvisoId(id);
        List<ContactoDto> pendientes = destinatarios.stream()
                .filter(d -> !leyeron.contains(d.getId()))
                .sorted(Comparator.comparing(Usuario::getApellido))
                .map(ContactoDto::de)
                .toList();
        int total = destinatarios.size();
        int leidos = total - pendientes.size();
        int porcentaje = total == 0 ? 0 : Math.round(leidos * 100f / total);
        return new LecturasDto(id, total, leidos, porcentaje, pendientes);
    }

    /** Para el panel de vigencias: lo mío (o todo, si soy gestor general) que vence pronto. */
    @Transactional(readOnly = true)
    public List<AvisoDto> porVencer(UsuarioAutenticado u) {
        LocalDateTime ahora = ahora();
        return avisoRepository.findByActivoTrueAndVigenteHastaBetweenOrderByVigenteHastaAsc(ahora,
                        ahora.plusDays(vigencia.getAvisoVencimientoDias())).stream()
                .filter(a -> u.tiene(Permiso.PUBLICAR_GENERAL) || a.getAutor().getId().equals(u.id()))
                .map(a -> toDto(a, false))
                .toList();
    }

    private void notificarSiCorresponde(Aviso a, Long autorId) {
        TipoNotificacion tipo = switch (a.getTipo()) {
            case URGENTE -> TipoNotificacion.AVISO_URGENTE;
            case CAMBIO_HORARIO -> TipoNotificacion.CAMBIO_HORARIO;
            case NOVEDAD -> a.isRequiereLectura() ? TipoNotificacion.AVISO_LECTURA_OBLIGATORIA : null;
        };
        if (tipo == null) {
            return;
        }
        List<Usuario> destinatarios = audiencia.destinatarios(a.getSectores()).stream()
                .filter(d -> !d.getId().equals(autorId))
                .toList();
        String prefijo = switch (tipo) {
            case AVISO_URGENTE -> "Urgente: ";
            case CAMBIO_HORARIO -> "Cambio de horario: ";
            default -> "Para leer: ";
        };
        notificaciones.notificar(destinatarios, tipo, prefijo + a.getTitulo(), resumen(a.getCuerpo()),
                "inicio.html?aviso=" + a.getId());
    }

    private Aviso buscar(Long id) {
        return avisoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Aviso", id));
    }

    private Aviso visible(Long id, UsuarioAutenticado u) {
        Aviso a = buscar(id);
        if (!a.esVisiblePara(u.sectorId(), ahora())) {
            throw new RecursoNoEncontradoException("Aviso", id);
        }
        return a;
    }

    private void validarEdicion(Aviso a, UsuarioAutenticado u) {
        boolean esAutor = a.getAutor().getId().equals(u.id());
        if (!u.tiene(Permiso.PUBLICAR_GENERAL) && !esAutor) {
            throw new AccesoDenegadoException("Solo quien publicó el aviso o Dirección pueden modificarlo");
        }
    }

    private AvisoDto toDto(Aviso a, boolean leido) {
        List<String> sectores = a.getSectores().stream().map(Sector::getNombre).sorted().toList();
        return new AvisoDto(a.getId(), a.getTitulo(), a.getCuerpo(), a.getTipo(), a.isFijado(),
                a.isRequiereLectura(), leido, a.getAutor().getNombreCompleto(), a.getPublicadoEn(),
                a.getVigenteHasta(), vigencia.porVencer(a.getVigenteHasta()), sectores);
    }

    private static String resumen(String texto) {
        return texto.length() <= 160 ? texto : texto.substring(0, 157) + "...";
    }

    private LocalDateTime ahora() {
        return LocalDateTime.now(clock);
    }
}
