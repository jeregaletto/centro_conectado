/**
 * Tipos de la API de Centro Conectado.
 * Generados a mano a partir de los records de backend/src/main/java/com/centroconectado/api/**\/dto
 * y de los enums de cada módulo. Si cambia un DTO en el backend, cambiá acá.
 *
 * Convenciones de fechas del backend (Jackson, zona America/Argentina/Buenos_Aires):
 * - `FechaHora` (LocalDateTime): "2026-11-12T14:00:00" o con fracción "2026-11-12T18:52:20.7037187", SIN zona.
 * - `Fecha` (LocalDate): "2026-11-12".
 * - `Instante` (Instant): "2026-11-13T09:00:00Z", con zona UTC.
 */

export type FechaHora = string;
export type Fecha = string;
export type Instante = string;

// ---------- usuarios ----------

export type Rol = "DIRECCION" | "COMUNICACION" | "REFERENTE" | "PROFESIONAL" | "ADMINISTRATIVO" | "MAESTRANZA";
export type Vista = "COMPLETA" | "SIMPLE";
export type Permiso =
  | "PUBLICAR_GENERAL"
  | "PUBLICAR_SECTOR"
  | "VER_LECTURAS"
  | "GESTIONAR_TAREAS_GENERAL"
  | "GESTIONAR_TAREAS_SECTOR"
  | "GESTIONAR_BUZON"
  | "GESTIONAR_BIBLIOTECA"
  | "GESTIONAR_USUARIOS"
  | "VER_TODOS_LOS_PEDIDOS";

/** SectorResumenDto */
export interface SectorResumen {
  id: number;
  codigo: string;
  nombre: string;
}

/** UsuarioActualDto: lo que viene en el login y en GET /api/auth/me */
export interface UsuarioActual {
  id: number;
  usuario: string;
  nombre: string;
  apellido: string;
  puesto: string;
  rol: Rol;
  rolEtiqueta: string;
  vista: Vista;
  sector: SectorResumen;
  permisos: Permiso[];
  debeCambiarPassword: boolean;
}

/** LoginResponse */
export interface LoginResponse {
  token: string;
  expiraEn: Instante;
  usuario: UsuarioActual;
}

/** LoginRequest */
export interface LoginRequest {
  usuario: string;
  password: string;
}

/** CambiarPasswordRequest */
export interface CambiarPasswordRequest {
  actual: string;
  nueva: string;
}

/** ContactoDto */
export interface Contacto {
  id: number;
  nombre: string;
  puesto: string | null;
  sector: string | null;
  telefono: string | null;
  interno: string | null;
  email: string | null;
}

/** SectorDto */
export interface Sector {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  referente: Contacto | null;
  integrantes: number;
}

/** AQuienAcudirDto */
export interface AQuienAcudir {
  id: number;
  tema: string;
  descripcion: string | null;
  sector: SectorResumen | null;
  contacto: Contacto | null;
}

/** UsuarioAdminDto */
export interface UsuarioAdmin {
  id: number;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  interno: string | null;
  puesto: string;
  rol: Rol;
  sector: SectorResumen;
  activo: boolean;
  debeCambiarPassword: boolean;
  creadoEn: FechaHora;
}

/** CrearUsuarioRequest */
export interface CrearUsuarioRequest {
  usuario: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  interno: string | null;
  puesto: string;
  rol: Rol;
  sectorId: number;
  passwordInicial: string;
}

/** ActualizarUsuarioRequest */
export interface ActualizarUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  interno: string | null;
  puesto: string;
  rol: Rol;
  sectorId: number;
  activo: boolean;
}

// ---------- avisos ----------

export type TipoAviso = "NOVEDAD" | "CAMBIO_HORARIO" | "URGENTE";

/** AvisoDto */
export interface Aviso {
  id: number;
  titulo: string;
  cuerpo: string;
  tipo: TipoAviso;
  fijado: boolean;
  requiereLectura: boolean;
  leido: boolean;
  autor: string;
  publicadoEn: FechaHora;
  vigenteHasta: FechaHora;
  porVencer: boolean;
  /** Vacío = todo el Centro. */
  sectores: string[];
}

/** GuardarAvisoRequest */
export interface GuardarAvisoRequest {
  titulo: string;
  cuerpo: string;
  tipo: TipoAviso;
  fijado: boolean;
  requiereLectura: boolean;
  vigenteHasta: FechaHora | null;
  /** Vacío = todo el Centro (solo Dirección/Comunicación). */
  sectorIds: number[];
}

/** LecturasDto */
export interface Lecturas {
  avisoId: number;
  destinatarios: number;
  leyeron: number;
  porcentaje: number;
  pendientes: Contacto[];
}

// ---------- agenda ----------

export type TipoEvento = "EVENTO" | "CAPACITACION" | "REUNION";

/** EventoDto */
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string | null;
  tipo: TipoEvento;
  lugar: string | null;
  inicio: FechaHora;
  fin: FechaHora;
  recordatorioMinutos: number | null;
  autor: string;
  sectores: string[];
}

/** GuardarEventoRequest */
export interface GuardarEventoRequest {
  titulo: string;
  descripcion: string | null;
  tipo: TipoEvento;
  lugar: string | null;
  inicio: FechaHora;
  fin: FechaHora;
  recordatorioMinutos: number | null;
  sectorIds: number[];
}

// ---------- notificaciones ----------

export type TipoNotificacion =
  | "AVISO_URGENTE"
  | "CAMBIO_HORARIO"
  | "AVISO_LECTURA_OBLIGATORIA"
  | "RECORDATORIO_EVENTO"
  | "PEDIDO_NUEVO"
  | "PEDIDO_ACTUALIZADO"
  | "BUZON_NUEVO"
  | "BUZON_RESPONDIDO"
  | "CONTENIDO_POR_VENCER"
  | "RESUMEN_SEMANAL";

/** NotificacionDto. `link` es una ruta de las maquetas viejas ("pedidos.html?id=3"): ver lib/notificaciones.ts */
export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string | null;
  link: string | null;
  leida: boolean;
  creadaEn: FechaHora;
}

/** ContadorDto */
export interface Contador {
  noLeidas: number;
}

// ---------- mi puesto ----------

export type Frecuencia = "DIARIA" | "SEMANAL";

/** AvanceDto */
export interface Avance {
  hechas: number;
  total: number;
  porcentaje: number;
}

/** TareaDelDiaDto */
export interface TareaDelDia {
  id: number;
  titulo: string;
  descripcion: string | null;
  icono: string;
  frecuencia: Frecuencia;
  completada: boolean;
  completadaEn: FechaHora | null;
}

/** ProtocoloDto */
export interface Protocolo {
  id: number;
  titulo: string;
  url: string;
}

/** MiPuestoDto */
export interface MiPuesto {
  fecha: Fecha;
  puesto: string | null;
  sector: string | null;
  tareas: TareaDelDia[];
  avance: Avance;
  referente: Contacto | null;
  protocolos: Protocolo[];
}

/** TareaPuestoDto */
export interface TareaPuesto {
  id: number;
  sector: SectorResumen;
  puesto: string | null;
  titulo: string;
  descripcion: string | null;
  icono: string;
  frecuencia: Frecuencia;
  orden: number;
  activa: boolean;
}

/** GuardarTareaRequest */
export interface GuardarTareaRequest {
  sectorId: number;
  puesto: string | null;
  titulo: string;
  descripcion: string | null;
  icono: string;
  frecuencia: Frecuencia;
  orden: number;
}

/** AvanceUsuarioDto */
export interface AvanceUsuario {
  usuario: Contacto;
  avance: Avance;
}

// ---------- pedidos ----------

export type TipoPedido = "PEDIDO" | "INTERCONSULTA";
export type Prioridad = "ALTA" | "MEDIA" | "BAJA";
export type EstadoPedido = "PENDIENTE" | "EN_CURSO" | "RESUELTO" | "RECHAZADO" | "CANCELADO";

/** PedidoDto */
export interface Pedido {
  id: number;
  codigo: string;
  tipo: TipoPedido;
  asunto: string;
  detalle: string;
  prioridad: Prioridad;
  estado: EstadoPedido;
  sectorOrigen: SectorResumen;
  sectorDestino: SectorResumen;
  creadoPor: string;
  asignadoA: string | null;
  plazo: FechaHora;
  vencido: boolean;
  /** Horas que faltan para el plazo (negativo = vencido). Null si está cerrado. */
  horasRestantes: number | null;
  creadoEn: FechaHora;
  actualizadoEn: FechaHora | null;
  cerradoEn: FechaHora | null;
}

/** MovimientoDto */
export interface Movimiento {
  id: number;
  usuario: string;
  estadoAnterior: EstadoPedido | null;
  estadoNuevo: EstadoPedido | null;
  comentario: string | null;
  creadoEn: FechaHora;
}

/** PedidoDetalleDto */
export interface PedidoDetalle {
  pedido: Pedido;
  historial: Movimiento[];
  puedoCambiarEstado: boolean;
  puedoCancelar: boolean;
}

/** CrearPedidoRequest */
export interface CrearPedidoRequest {
  tipo: TipoPedido;
  asunto: string;
  detalle: string;
  sectorDestinoId: number;
  prioridad: Prioridad | null;
  plazo?: FechaHora | null;
  asignadoAId?: number | null;
}

/** CambiarEstadoPedidoRequest */
export interface CambiarEstadoPedidoRequest {
  estado: EstadoPedido;
  comentario: string | null;
}

// ---------- buzón ----------

export type TipoMensaje = "CONSULTA" | "SUGERENCIA" | "RECLAMO";
export type EstadoMensaje = "RECIBIDO" | "EN_REVISION" | "RESPONDIDO" | "CERRADO";

/** MensajeBuzonDto */
export interface MensajeBuzon {
  id: number;
  codigoSeguimiento: string;
  tipo: TipoMensaje;
  asunto: string;
  cuerpo: string;
  anonimo: boolean;
  /** Solo visible para gestores y si no es anónimo. */
  autor: string | null;
  sector: string | null;
  estado: EstadoMensaje;
  creadoEn: FechaHora;
  plazoRespuesta: FechaHora;
  vencido: boolean;
  respuesta: string | null;
  respondidoEn: FechaHora | null;
}

/** EnviarMensajeRequest */
export interface EnviarMensajeRequest {
  tipo: TipoMensaje;
  asunto: string;
  cuerpo: string;
  anonimo: boolean;
}

// ---------- biblioteca ----------

export type CategoriaDocumento = "PROTOCOLO" | "MANUAL_INDUCCION" | "REGLAMENTO" | "INSTITUCIONAL" | "KIT_BIENVENIDA";

/** DocumentoDto */
export interface Documento {
  id: number;
  titulo: string;
  descripcion: string | null;
  categoria: CategoriaDocumento;
  url: string;
  sector: SectorResumen | null;
  version: string | null;
  publicadoPor: string;
  publicadoEn: FechaHora;
  vigenteHasta: FechaHora;
  porVencer: boolean;
}

/** GuardarDocumentoRequest */
export interface GuardarDocumentoRequest {
  titulo: string;
  descripcion: string | null;
  categoria: CategoriaDocumento;
  url: string;
  sectorId: number | null;
  version: string | null;
  vigenteHasta: FechaHora | null;
}

// ---------- inicio ----------

/** InicioDto */
export interface Inicio {
  fecha: Fecha;
  saludo: string;
  nombre: string;
  rolEtiqueta: string;
  vista: Vista;
  /** Fijados arriba + los de lectura obligatoria que todavía no leíste. */
  fijados: Aviso[];
  novedades: Aviso[];
  agendaHoy: Evento[];
  notificacionesNoLeidas: number;
  pedidosPendientes: number;
  /** Null si no tenés tareas de puesto. */
  tareasHoy: Avance | null;
}

/** ResumenSemanalDto */
export interface ResumenSemanal {
  desde: Fecha;
  hasta: Fecha;
  avisosNuevos: number;
  avisosDestacados: string[];
  agendaSemana: Evento[];
  pedidosPendientes: number;
  pedidosVencidos: number;
  /** Solo para gestores del buzón; null para el resto. */
  buzonSinResponder: number | null;
}

// ---------- errores ----------

/** ErrorResponse: formato único de error del backend. */
export interface ErrorResponse {
  timestamp: Instante;
  status: number;
  error: string;
  mensaje: string;
  path: string;
  campos: Record<string, string> | null;
}
