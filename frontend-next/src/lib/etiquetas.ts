import type { TonoChip } from "@/components/ui/Tarjeta";
import type {
  CategoriaDocumento,
  EstadoMensaje,
  EstadoPedido,
  Prioridad,
  Rol,
  TipoAviso,
  TipoEvento,
  TipoMensaje,
  TipoPedido,
} from "@/lib/tipos";

/** Textos de los enums del backend, en español de Argentina. */

export const TIPO_AVISO: Record<TipoAviso, string> = {
  NOVEDAD: "Novedad",
  CAMBIO_HORARIO: "Cambio de horario",
  URGENTE: "Urgente",
};
export const TONO_AVISO: Record<TipoAviso, TonoChip> = { NOVEDAD: "neutro", CAMBIO_HORARIO: "alerta", URGENTE: "error" };

export const TIPO_EVENTO: Record<TipoEvento, string> = { EVENTO: "Evento", CAPACITACION: "Capacitación", REUNION: "Reunión" };

export const ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_CURSO: "En curso",
  RESUELTO: "Resuelto",
  RECHAZADO: "Rechazado",
  CANCELADO: "Cancelado",
};
export const TONO_PEDIDO: Record<EstadoPedido, TonoChip> = {
  PENDIENTE: "info",
  EN_CURSO: "alerta",
  RESUELTO: "ok",
  RECHAZADO: "error",
  CANCELADO: "apagado",
};
export const PRIORIDAD: Record<Prioridad, string> = { ALTA: "Alta (24 h)", MEDIA: "Normal (72 h)", BAJA: "Baja (7 días)" };
export const TIPO_PEDIDO: Record<TipoPedido, string> = { PEDIDO: "Pedido", INTERCONSULTA: "Interconsulta" };

export const ESTADO_MENSAJE: Record<EstadoMensaje, string> = {
  RECIBIDO: "Recibido",
  EN_REVISION: "En revisión",
  RESPONDIDO: "Respondido",
  CERRADO: "Cerrado",
};
export const TONO_MENSAJE: Record<EstadoMensaje, TonoChip> = {
  RECIBIDO: "info",
  EN_REVISION: "alerta",
  RESPONDIDO: "ok",
  CERRADO: "apagado",
};
export const TIPO_MENSAJE: Record<TipoMensaje, string> = { CONSULTA: "Consulta", SUGERENCIA: "Sugerencia", RECLAMO: "Reclamo" };

export const CATEGORIA_DOCUMENTO: Record<CategoriaDocumento, string> = {
  PROTOCOLO: "Protocolos",
  MANUAL_INDUCCION: "Manual de inducción",
  REGLAMENTO: "Reglamentos",
  INSTITUCIONAL: "Institucional",
  KIT_BIENVENIDA: "Kit de bienvenida",
};

export const ROL: Record<Rol, string> = {
  DIRECCION: "Dirección",
  COMUNICACION: "Calidad y comunicación",
  REFERENTE: "Referente de sector",
  PROFESIONAL: "Profesional",
  ADMINISTRATIVO: "Administrativo",
  MAESTRANZA: "Maestranza",
};

/** "1 pedido pendiente" / "3 pedidos pendientes" */
export function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}
