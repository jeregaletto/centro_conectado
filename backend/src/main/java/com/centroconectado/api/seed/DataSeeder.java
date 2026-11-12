package com.centroconectado.api.seed;

import java.text.Normalizer;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.agenda.Evento;
import com.centroconectado.api.agenda.EventoRepository;
import com.centroconectado.api.agenda.TipoEvento;
import com.centroconectado.api.avisos.Aviso;
import com.centroconectado.api.avisos.AvisoRepository;
import com.centroconectado.api.avisos.TipoAviso;
import com.centroconectado.api.biblioteca.CategoriaDocumento;
import com.centroconectado.api.biblioteca.Documento;
import com.centroconectado.api.biblioteca.DocumentoRepository;
import com.centroconectado.api.buzon.MensajeBuzon;
import com.centroconectado.api.buzon.MensajeBuzonRepository;
import com.centroconectado.api.buzon.TipoMensaje;
import com.centroconectado.api.pedidos.EstadoPedido;
import com.centroconectado.api.pedidos.Pedido;
import com.centroconectado.api.pedidos.PedidoMovimiento;
import com.centroconectado.api.pedidos.PedidoMovimientoRepository;
import com.centroconectado.api.pedidos.PedidoRepository;
import com.centroconectado.api.pedidos.Prioridad;
import com.centroconectado.api.pedidos.TipoPedido;
import com.centroconectado.api.puesto.Frecuencia;
import com.centroconectado.api.puesto.TareaPuesto;
import com.centroconectado.api.puesto.TareaPuestoRepository;
import com.centroconectado.api.usuarios.AQuienAcudir;
import com.centroconectado.api.usuarios.AQuienAcudirRepository;
import com.centroconectado.api.usuarios.Rol;
import com.centroconectado.api.usuarios.Sector;
import com.centroconectado.api.usuarios.SectorRepository;
import com.centroconectado.api.usuarios.Usuario;
import com.centroconectado.api.usuarios.UsuarioRepository;

/**
 * Datos de demo. Corre solo si app.seed=true y la base está vacía.
 * Todos los usuarios demo usan la contraseña: Centro2026!
 */
@Component
@ConditionalOnProperty(prefix = "app", name = "seed", havingValue = "true")
public class DataSeeder implements ApplicationRunner {

    public static final String PASSWORD_DEMO = "Centro2026!";
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final SectorRepository sectorRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvisoRepository avisoRepository;
    private final EventoRepository eventoRepository;
    private final TareaPuestoRepository tareaRepository;
    private final PedidoRepository pedidoRepository;
    private final PedidoMovimientoRepository movimientoRepository;
    private final MensajeBuzonRepository buzonRepository;
    private final DocumentoRepository documentoRepository;
    private final AQuienAcudirRepository aQuienAcudirRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public DataSeeder(SectorRepository sectorRepository, UsuarioRepository usuarioRepository,
                      AvisoRepository avisoRepository, EventoRepository eventoRepository,
                      TareaPuestoRepository tareaRepository, PedidoRepository pedidoRepository,
                      PedidoMovimientoRepository movimientoRepository, MensajeBuzonRepository buzonRepository,
                      DocumentoRepository documentoRepository, AQuienAcudirRepository aQuienAcudirRepository,
                      PasswordEncoder passwordEncoder, Clock clock) {
        this.sectorRepository = sectorRepository;
        this.usuarioRepository = usuarioRepository;
        this.avisoRepository = avisoRepository;
        this.eventoRepository = eventoRepository;
        this.tareaRepository = tareaRepository;
        this.pedidoRepository = pedidoRepository;
        this.movimientoRepository = movimientoRepository;
        this.buzonRepository = buzonRepository;
        this.documentoRepository = documentoRepository;
        this.aQuienAcudirRepository = aQuienAcudirRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            log.info("Seed omitido: la base ya tiene usuarios");
            return;
        }
        LocalDateTime ahora = LocalDateTime.now(clock);
        LocalDate hoy = ahora.toLocalDate();
        String hash = passwordEncoder.encode(PASSWORD_DEMO);

        // --- Sectores ---
        Map<String, Sector> s = new HashMap<>();
        s.put("DIR", sectorRepository.save(new Sector("DIRECCION", "Dirección", "Dirección médica y administrativa")));
        s.put("CAL", sectorRepository.save(new Sector("CALIDAD", "Calidad y Comunicación", "Responsable general de la información")));
        s.put("ENF", sectorRepository.save(new Sector("ENFERMERIA", "Enfermería", "Equipo de enfermería de todos los turnos")));
        s.put("KIN", sectorRepository.save(new Sector("KINESIOLOGIA", "Kinesiología", "Rehabilitación y kinesiología")));
        s.put("ADM", sectorRepository.save(new Sector("ADMINISTRACION", "Administración", "Admisión, facturación y RR.HH.")));
        s.put("MAE", sectorRepository.save(new Sector("MAESTRANZA", "Maestranza", "Limpieza, mantenimiento y apoyo")));

        // --- Usuarios (usuario = DNI o alias de demo) ---
        Usuario direccion = usuario("direccion", hash, "Laura", "Méndez", "Directora", Rol.DIRECCION, s.get("DIR"), "101", ahora);
        Usuario comunicacion = usuario("comunicacion", hash, "Pablo", "Ríos", "Responsable de Calidad", Rol.COMUNICACION, s.get("CAL"), "102", ahora);
        Usuario refEnf = usuario("referente.enf", hash, "Marta", "Gómez", "Jefa de Enfermería", Rol.REFERENTE, s.get("ENF"), "201", ahora);
        Usuario enfermero = usuario("enfermero", hash, "Diego", "Sosa", "Enfermero", Rol.PROFESIONAL, s.get("ENF"), "202", ahora);
        Usuario kinesio = usuario("kinesio", hash, "Ana", "Torres", "Kinesióloga", Rol.PROFESIONAL, s.get("KIN"), "301", ahora);
        Usuario refKin = usuario("referente.kin", hash, "Sergio", "Paz", "Coordinador de Kinesiología", Rol.REFERENTE, s.get("KIN"), "300", ahora);
        Usuario admin = usuario("administracion", hash, "Carla", "Núñez", "Administrativa", Rol.ADMINISTRATIVO, s.get("ADM"), "401", ahora);
        Usuario refMae = usuario("referente.mae", hash, "Jorge", "Díaz", "Encargado de Maestranza", Rol.REFERENTE, s.get("MAE"), "501", ahora);
        Usuario maestranza = usuario("maestranza", hash, "Rosa", "Benítez", "Auxiliar de limpieza", Rol.MAESTRANZA, s.get("MAE"), null, ahora);
        refMae.setTelefono("11 5555-0501");
        refEnf.setTelefono("11 5555-0201");

        s.get("DIR").setReferente(direccion);
        s.get("CAL").setReferente(comunicacion);
        s.get("ENF").setReferente(refEnf);
        s.get("KIN").setReferente(refKin);
        s.get("ADM").setReferente(admin);
        s.get("MAE").setReferente(refMae);

        // --- Avisos ---
        Aviso bienvenida = new Aviso("Nueva forma de comunicarnos",
                "Desde hoy lo oficial va por Centro Conectado. WhatsApp queda solo para lo urgente. "
                        + "Por favor, marcá este aviso como leído.",
                TipoAviso.NOVEDAD, true, true, comunicacion, ahora.minusDays(1), ahora.plusDays(30));
        avisoRepository.save(bienvenida);

        Aviso horario = new Aviso("Cambio de horario turno noche",
                "A partir del lunes el turno noche ingresa 21:30 en lugar de 22:00 para el pase de guardia.",
                TipoAviso.CAMBIO_HORARIO, false, true, refEnf, ahora.minusHours(5), ahora.plusDays(10));
        horario.reemplazarSectores(Set.of(s.get("ENF")));
        avisoRepository.save(horario);

        Aviso urgenteMae = new Aviso("Corte de agua 14 a 16 h",
                "Mantenimiento de tanque. Reprogramar limpieza de baños del primer piso para después de las 16 h.",
                TipoAviso.URGENTE, true, false, refMae, ahora.minusHours(2), ahora.plusDays(1));
        urgenteMae.reemplazarSectores(Set.of(s.get("MAE")));
        avisoRepository.save(urgenteMae);

        avisoRepository.save(new Aviso("Campaña de vacunación antigripal",
                "Del 18 al 22 en el consultorio 3, de 9 a 12 h. Traer DNI.",
                TipoAviso.NOVEDAD, false, false, direccion, ahora.minusDays(2), ahora.plusDays(14)));
        avisoRepository.save(new Aviso("Nuevo menú del comedor",
                "Se suma opción vegetariana todos los días.",
                TipoAviso.NOVEDAD, false, false, comunicacion, ahora.minusDays(3), ahora.plusDays(2)));

        // --- Agenda ---
        Evento reunion = new Evento("Reunión de equipo de enfermería", "Pase de novedades y protocolos.",
                TipoEvento.REUNION, "Sala de reuniones", hoy.atTime(14, 0), hoy.atTime(15, 0), 30, refEnf, ahora);
        reunion.reemplazarSectores(Set.of(s.get("ENF")));
        eventoRepository.save(reunion);
        eventoRepository.save(new Evento("Capacitación: lavado de manos", "Obligatoria para todo el personal.",
                TipoEvento.CAPACITACION, "SUM", hoy.atTime(10, 0), hoy.atTime(11, 0), 60, comunicacion, ahora));
        eventoRepository.save(new Evento("Desayuno de bienvenida", "Recibimos a las personas que ingresaron este mes.",
                TipoEvento.EVENTO, "Sala de descanso", hoy.plusDays(2).atTime(9, 0), hoy.plusDays(2).atTime(10, 0),
                1440, direccion, ahora));

        // --- Mi puesto: maestranza con íconos grandes ---
        Sector mae = s.get("MAE");
        tareaRepository.save(new TareaPuesto(mae, null, "Limpiar baños planta baja", "Con producto azul. Reponer papel.", "banio", Frecuencia.DIARIA, 1));
        tareaRepository.save(new TareaPuesto(mae, null, "Vaciar cestos", "Bolsa negra: común. Bolsa roja: patogénicos.", "basura", Frecuencia.DIARIA, 2));
        tareaRepository.save(new TareaPuesto(mae, null, "Trapear pasillos", "Poner cartel de piso mojado.", "trapeador", Frecuencia.DIARIA, 3));
        tareaRepository.save(new TareaPuesto(mae, null, "Limpiar sala de espera", "Sillas, mesas y picaportes.", "silla", Frecuencia.DIARIA, 4));
        tareaRepository.save(new TareaPuesto(mae, null, "Reponer jabón y alcohol", "Todos los dispensers.", "jabon", Frecuencia.DIARIA, 5));
        tareaRepository.save(new TareaPuesto(mae, null, "Limpiar vidrios", "Ventanas de planta baja.", "ventana", Frecuencia.SEMANAL, 1));
        tareaRepository.save(new TareaPuesto(mae, null, "Revisar stock de limpieza", "Avisar a tu referente lo que falta.", "caja", Frecuencia.SEMANAL, 2));
        Sector enf = s.get("ENF");
        tareaRepository.save(new TareaPuesto(enf, null, "Control de carro de paro", "Checklist y firma.", "carro", Frecuencia.DIARIA, 1));
        tareaRepository.save(new TareaPuesto(enf, null, "Registro de temperatura de heladera", "Mañana y tarde.", "termometro", Frecuencia.DIARIA, 2));
        tareaRepository.save(new TareaPuesto(enf, null, "Revisión de vencimientos de medicación", "Botiquín del office.", "pastilla", Frecuencia.SEMANAL, 1));

        // --- Pedidos entre áreas ---
        Pedido p1 = pedido(TipoPedido.INTERCONSULTA, "Evaluación kinésica habitación 12",
                "Paciente con movilidad reducida post-quirúrgica. Sin datos personales: ver historia clínica.",
                Prioridad.ALTA, enf, s.get("KIN"), enfermero, ahora.minusHours(30));
        Pedido p2 = pedido(TipoPedido.PEDIDO, "Reposición de guantes talle M",
                "Quedan dos cajas en el office de enfermería.", Prioridad.MEDIA, enf, s.get("ADM"), refEnf,
                ahora.minusHours(10));
        Pedido p3 = pedido(TipoPedido.PEDIDO, "Limpieza de consultorio 2",
                "Se derramó solución fisiológica.", Prioridad.ALTA, s.get("KIN"), mae, kinesio, ahora.minusHours(1));
        p2.cambiarEstado(EstadoPedido.EN_CURSO, ahora.minusHours(4));
        p2.setAsignadoA(admin);
        movimientoRepository.save(new PedidoMovimiento(p2, admin, EstadoPedido.PENDIENTE, EstadoPedido.EN_CURSO,
                "Pedido hecho al proveedor", ahora.minusHours(4)));
        log.debug("Pedidos demo: {}, {}, {}", p1.getCodigo(), p2.getCodigo(), p3.getCodigo());

        // --- Buzón ---
        buzonRepository.save(new MensajeBuzon("DEMO7K3P9Q", TipoMensaje.SUGERENCIA, "Más sillas en la sala de descanso",
                "En el horario de almuerzo no alcanzan.", false, maestranza, mae, ahora.plusHours(48), ahora.minusHours(24)));
        buzonRepository.save(new MensajeBuzon("DEMO4M8W2T", TipoMensaje.RECLAMO, "Demora en respuestas de otras áreas",
                "Las interconsultas tardan más de 3 días.", true, null, null, ahora.minusHours(2), ahora.minusHours(74)));

        // --- Biblioteca ---
        doc("Manual de inducción", "Todo lo que necesitás saber en tu primera semana.", CategoriaDocumento.MANUAL_INDUCCION, null, comunicacion, ahora, 120);
        doc("Reglamento interno básico", "Horarios, licencias y uso de espacios.", CategoriaDocumento.REGLAMENTO, null, direccion, ahora, 120);
        doc("Misión, visión y valores", null, CategoriaDocumento.INSTITUCIONAL, null, direccion, ahora, 120);
        doc("Kit de bienvenida", "Plano, contactos y primeros pasos.", CategoriaDocumento.KIT_BIENVENIDA, null, comunicacion, ahora, 120);
        doc("Protocolo de higiene de manos", "Los 5 momentos.", CategoriaDocumento.PROTOCOLO, null, comunicacion, ahora, 2); // vence pronto: demo de "por vencer"
        doc("Protocolo de residuos patogénicos", "Bolsa roja, manipulación y traslado.", CategoriaDocumento.PROTOCOLO, mae, refMae, ahora, 120);
        doc("Protocolo de pase de guardia", "Estructura SBAR.", CategoriaDocumento.PROTOCOLO, enf, refEnf, ahora, 120);

        // --- A quién acudir ---
        aQuienAcudirRepository.save(new AQuienAcudir("Licencias y recibos de sueldo", "RR.HH. dentro de Administración", s.get("ADM"), admin, 1));
        aQuienAcudirRepository.save(new AQuienAcudir("Falta de insumos de limpieza", null, mae, refMae, 2));
        aQuienAcudirRepository.save(new AQuienAcudir("Cambios de turno de enfermería", null, enf, refEnf, 3));
        aQuienAcudirRepository.save(new AQuienAcudir("Problemas con la app o un aviso", null, s.get("CAL"), comunicacion, 4));
        aQuienAcudirRepository.save(new AQuienAcudir("Algo urgente fuera de horario", "Llamar a la guardia de Dirección", s.get("DIR"), direccion, 5));

        log.info("Seed de demo cargado. Usuarios: direccion, comunicacion, referente.enf, enfermero, kinesio, "
                + "referente.kin, administracion, referente.mae, maestranza · contraseña: {}", PASSWORD_DEMO);
    }

    private Usuario usuario(String usuario, String hash, String nombre, String apellido, String puesto, Rol rol,
                            Sector sector, String interno, LocalDateTime ahora) {
        Usuario u = new Usuario(usuario, hash, nombre, apellido, puesto, rol, sector, ahora);
        u.setInterno(interno);
        u.setEmail(rol == Rol.MAESTRANZA ? null : usuario.replace('.', '_') + "@centro.demo");
        u.setDebeCambiarPassword(false);
        return usuarioRepository.save(u);
    }

    private Pedido pedido(TipoPedido tipo, String asunto, String detalle, Prioridad prioridad, Sector origen,
                          Sector destino, Usuario creador, LocalDateTime creadoEn) {
        Pedido p = new Pedido(tipo, asunto, detalle, prioridad, origen, destino, creador, null,
                creadoEn.plusHours(prioridad.getHorasPlazo()), creadoEn);
        pedidoRepository.save(p);
        p.setCodigo(String.format("%s-%06d", tipo == TipoPedido.INTERCONSULTA ? "INT" : "PED", p.getId()));
        movimientoRepository.save(new PedidoMovimiento(p, creador, null, EstadoPedido.PENDIENTE, "Pedido creado", creadoEn));
        return p;
    }

    private void doc(String titulo, String descripcion, CategoriaDocumento categoria, Sector sector, Usuario autor,
                     LocalDateTime ahora, int diasVigencia) {
        String slug = Normalizer.normalize(titulo, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-");
        documentoRepository.save(new Documento(titulo, descripcion, categoria, "/docs/" + slug + ".pdf", sector,
                "1.0", autor, ahora.minusDays(10), ahora.plusDays(diasVigencia)));
    }
}
