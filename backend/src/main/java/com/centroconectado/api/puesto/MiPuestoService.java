package com.centroconectado.api.puesto;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.biblioteca.BibliotecaService;
import com.centroconectado.api.common.exception.AccesoDenegadoException;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.puesto.dto.AvanceDto;
import com.centroconectado.api.puesto.dto.AvanceUsuarioDto;
import com.centroconectado.api.puesto.dto.GuardarTareaRequest;
import com.centroconectado.api.puesto.dto.MiPuestoDto;
import com.centroconectado.api.puesto.dto.ProtocoloDto;
import com.centroconectado.api.puesto.dto.TareaDelDiaDto;
import com.centroconectado.api.puesto.dto.TareaPuestoDto;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.Permiso;
import com.centroconectado.api.usuarios.Sector;
import com.centroconectado.api.usuarios.SectorRepository;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;
import com.centroconectado.api.usuarios.dto.ContactoDto;

@Service
public class MiPuestoService {

    private static final int MAX_PROTOCOLOS = 5;

    private final TareaPuestoRepository tareaRepository;
    private final TareaRegistroRepository registroRepository;
    private final UsuarioRepository usuarioRepository;
    private final SectorRepository sectorRepository;
    private final BibliotecaService bibliotecaService;
    private final Clock clock;

    public MiPuestoService(TareaPuestoRepository tareaRepository, TareaRegistroRepository registroRepository,
                           UsuarioRepository usuarioRepository, SectorRepository sectorRepository,
                           BibliotecaService bibliotecaService, Clock clock) {
        this.tareaRepository = tareaRepository;
        this.registroRepository = registroRepository;
        this.usuarioRepository = usuarioRepository;
        this.sectorRepository = sectorRepository;
        this.bibliotecaService = bibliotecaService;
        this.clock = clock;
    }

    // ---------- Vista del empleado ----------

    @Transactional(readOnly = true)
    public MiPuestoDto miPuesto(UsuarioAutenticado p) {
        Usuario u = usuario(p.id());
        LocalDate hoy = LocalDate.now(clock);
        List<TareaPuesto> tareas = tareaRepository.findAplicables(u.getSector().getId(), u.getPuesto());
        Map<String, TareaRegistro> registros = registrosPorClave(
                registroRepository.findByUsuarioIdAndPeriodoIn(u.getId(), periodos(hoy)));

        List<TareaDelDiaDto> items = new ArrayList<>();
        int hechas = 0;
        for (TareaPuesto t : tareas) {
            TareaRegistro r = registros.get(clave(t.getId(), t.getFrecuencia().periodo(hoy)));
            if (r != null) {
                hechas++;
            }
            items.add(new TareaDelDiaDto(t.getId(), t.getTitulo(), t.getDescripcion(), t.getIcono(),
                    t.getFrecuencia(), r != null, r != null ? r.getCompletadaEn() : null));
        }
        List<ProtocoloDto> protocolos = bibliotecaService.protocolosDeSector(u.getSector().getId(), MAX_PROTOCOLOS)
                .stream().map(d -> new ProtocoloDto(d.id(), d.titulo(), d.url())).toList();

        return new MiPuestoDto(hoy, u.getPuesto(), u.getSector().getNombre(), items,
                AvanceDto.de(hechas, tareas.size()), ContactoDto.de(u.getSector().getReferente()), protocolos);
    }

    @Transactional(readOnly = true)
    public AvanceDto avanceDeHoy(UsuarioAutenticado p) {
        MiPuestoDto mp = miPuesto(p);
        return mp.avance();
    }

    @Transactional
    public MiPuestoDto completar(Long tareaId, UsuarioAutenticado p) {
        Usuario u = usuario(p.id());
        TareaPuesto t = tareaAplicable(tareaId, u);
        LocalDate periodo = t.getFrecuencia().periodo(LocalDate.now(clock));
        if (registroRepository.findByTareaIdAndUsuarioIdAndPeriodo(tareaId, u.getId(), periodo).isEmpty()) {
            registroRepository.save(new TareaRegistro(t, u, periodo, LocalDateTime.now(clock)));
        }
        return miPuesto(p);
    }

    @Transactional
    public MiPuestoDto desmarcar(Long tareaId, UsuarioAutenticado p) {
        Usuario u = usuario(p.id());
        TareaPuesto t = tareaAplicable(tareaId, u);
        LocalDate periodo = t.getFrecuencia().periodo(LocalDate.now(clock));
        registroRepository.findByTareaIdAndUsuarioIdAndPeriodo(tareaId, u.getId(), periodo)
                .ifPresent(registroRepository::delete);
        return miPuesto(p);
    }

    // ---------- Gestión (referente / dirección) ----------

    @Transactional(readOnly = true)
    public List<TareaPuestoDto> listarTareas(Long sectorId, UsuarioAutenticado p) {
        Long objetivo = sectorGestionable(sectorId, p);
        return tareaRepository.findBySectorIdAndActivaTrueOrderByFrecuenciaAscOrdenAsc(objetivo).stream()
                .map(TareaPuestoDto::de).toList();
    }

    @Transactional
    public TareaPuestoDto crearTarea(GuardarTareaRequest req, UsuarioAutenticado p) {
        Sector sector = sector(sectorGestionable(req.sectorId(), p));
        TareaPuesto t = new TareaPuesto(sector, normalizarPuesto(req.puesto()), req.titulo().trim(),
                req.descripcion(), req.icono().trim(), req.frecuencia(), req.orden());
        return TareaPuestoDto.de(tareaRepository.save(t));
    }

    @Transactional
    public TareaPuestoDto actualizarTarea(Long id, GuardarTareaRequest req, UsuarioAutenticado p) {
        TareaPuesto t = tarea(id);
        sectorGestionable(t.getSector().getId(), p);
        t.setSector(sector(sectorGestionable(req.sectorId(), p)));
        t.setPuesto(normalizarPuesto(req.puesto()));
        t.setTitulo(req.titulo().trim());
        t.setDescripcion(req.descripcion());
        t.setIcono(req.icono().trim());
        t.setFrecuencia(req.frecuencia());
        t.setOrden(req.orden());
        return TareaPuestoDto.de(t);
    }

    @Transactional
    public void eliminarTarea(Long id, UsuarioAutenticado p) {
        TareaPuesto t = tarea(id);
        sectorGestionable(t.getSector().getId(), p);
        t.setActiva(false);
    }

    /** Tablero del referente: cuánto avanzó hoy cada persona de su sector. */
    @Transactional(readOnly = true)
    public List<AvanceUsuarioDto> avanceSector(Long sectorId, UsuarioAutenticado p) {
        Long objetivo = sectorGestionable(sectorId, p);
        LocalDate hoy = LocalDate.now(clock);
        List<TareaPuesto> tareasSector = tareaRepository.findBySectorIdAndActivaTrueOrderByFrecuenciaAscOrdenAsc(objetivo);
        Map<String, TareaRegistro> registros = registrosPorUsuario(
                registroRepository.findByTareaSectorIdAndPeriodoIn(objetivo, periodos(hoy)));

        return usuarioRepository.findByActivoTrueAndSectorId(objetivo).stream()
                .map(u -> {
                    List<TareaPuesto> aplicables = tareasSector.stream()
                            .filter(t -> t.aplicaA(objetivo, u.getPuesto()))
                            .toList();
                    int hechas = (int) aplicables.stream()
                            .filter(t -> registros.containsKey(
                                    u.getId() + "|" + clave(t.getId(), t.getFrecuencia().periodo(hoy))))
                            .count();
                    return new AvanceUsuarioDto(ContactoDto.de(u), AvanceDto.de(hechas, aplicables.size()));
                })
                .toList();
    }

    // ---------- helpers ----------

    private Long sectorGestionable(Long sectorId, UsuarioAutenticado p) {
        Long objetivo = sectorId != null ? sectorId : p.sectorId();
        if (p.tiene(Permiso.GESTIONAR_TAREAS_GENERAL)) {
            return objetivo;
        }
        if (p.tiene(Permiso.GESTIONAR_TAREAS_SECTOR) && objetivo.equals(p.sectorId())) {
            return objetivo;
        }
        throw new AccesoDenegadoException("Solo podés gestionar las tareas de tu sector");
    }

    private TareaPuesto tareaAplicable(Long tareaId, Usuario u) {
        TareaPuesto t = tarea(tareaId);
        if (!t.aplicaA(u.getSector().getId(), u.getPuesto())) {
            throw new AccesoDenegadoException("Esa tarea no corresponde a tu puesto");
        }
        return t;
    }

    private static List<LocalDate> periodos(LocalDate hoy) {
        return List.of(Frecuencia.DIARIA.periodo(hoy), Frecuencia.SEMANAL.periodo(hoy));
    }

    private static String clave(Long tareaId, LocalDate periodo) {
        return tareaId + "@" + periodo;
    }

    private static Map<String, TareaRegistro> registrosPorClave(List<TareaRegistro> registros) {
        return registros.stream().collect(Collectors.toMap(
                r -> clave(r.getTarea().getId(), r.getPeriodo()), Function.identity(), (a, b) -> a));
    }

    private static Map<String, TareaRegistro> registrosPorUsuario(List<TareaRegistro> registros) {
        return registros.stream().collect(Collectors.toMap(
                r -> r.getUsuario().getId() + "|" + clave(r.getTarea().getId(), r.getPeriodo()),
                Function.identity(), (a, b) -> a));
    }

    private static String normalizarPuesto(String puesto) {
        return puesto == null || puesto.isBlank() ? null : puesto.trim();
    }

    private Usuario usuario(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
    }

    private Sector sector(Long id) {
        return sectorRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Sector", id));
    }

    private TareaPuesto tarea(Long id) {
        return tareaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Tarea", id));
    }
}
