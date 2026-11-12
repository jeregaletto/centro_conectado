import type { Fecha, FechaHora } from "@/lib/tipos";

/**
 * Formateo de fechas en es-AR.
 *
 * La API devuelve fechas "de reloj" de Buenos Aires sin zona ("2026-11-12T14:00:00") y días sin hora
 * ("2026-11-12"). Las mostramos TAL CUAL: armamos un Date en UTC con esos números y formateamos en UTC.
 * Así no depende de la zona del navegador ni del servidor (y no hay diferencias de hidratación).
 *
 * Nunca usar `new Date("2026-11-12")`: lo interpreta como medianoche UTC y en Argentina muestra el día anterior.
 */

export const ZONA_CENTRO = "America/Argentina/Buenos_Aires";
const LOCALE = "es-AR";

const PATRON = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/;

interface Partes {
  anio: number;
  mes: number; // 1-12
  dia: number;
  hora: number;
  minuto: number;
}

/** Hora de reloj de Buenos Aires para un instante absoluto. */
function partesEnBuenosAires(instante: Date): Partes {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_CENTRO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const n = (tipo: Intl.DateTimeFormatPartTypes) => Number(p.find((x) => x.type === tipo)?.value ?? 0);
  return { anio: n("year"), mes: n("month"), dia: n("day"), hora: n("hour"), minuto: n("minute") };
}

export function partes(iso: string): Partes {
  const m = PATRON.exec(iso.trim());
  if (!m) throw new Error(`Fecha inválida: ${iso}`);
  if (m[7]) {
    // Trae zona (un Instant, ej: expiraEn): lo pasamos a la hora de reloj del Centro.
    return partesEnBuenosAires(new Date(iso));
  }
  return {
    anio: Number(m[1]),
    mes: Number(m[2]),
    dia: Number(m[3]),
    hora: m[4] ? Number(m[4]) : 0,
    minuto: m[5] ? Number(m[5]) : 0,
  };
}

/** Date "de reloj": los números de la fecha puestos en UTC. Solo para formatear con timeZone UTC. */
function relojUTC(iso: string): Date {
  const p = partes(iso);
  return new Date(Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto));
}

const formatos = {
  fecha: new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", timeZone: "UTC" }),
  hora: new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" }),
  fechaLarga: new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
};

/** "12 nov" */
export const fecha = (iso: Fecha | FechaHora): string => formatos.fecha.format(relojUTC(iso));
/** "14:00" */
export const hora = (iso: FechaHora): string => formatos.hora.format(relojUTC(iso));
/** "jueves, 12 de noviembre" */
export const fechaLarga = (iso: Fecha | FechaHora): string => formatos.fechaLarga.format(relojUTC(iso));
/** "12 nov, 14:00" */
export const fechaHora = (iso: FechaHora): string => `${fecha(iso)}, ${hora(iso)}`;

const dos = (n: number) => String(n).padStart(2, "0");

/** Día de hoy en Buenos Aires, "2026-11-12". `ahora` se inyecta en los tests. */
export function hoy(ahora: Date = new Date()): Fecha {
  const p = partesEnBuenosAires(ahora);
  return `${p.anio}-${dos(p.mes)}-${dos(p.dia)}`;
}

/** Suma (o resta) días a una fecha sin hora, sin pasar por la zona del proceso. */
export function sumarDias(dia: Fecha, n: number): Fecha {
  const p = partes(dia);
  const d = new Date(Date.UTC(p.anio, p.mes - 1, p.dia + n));
  return `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}`;
}

/** Parte de día de una FechaHora: "2026-11-12T14:00:00" → "2026-11-12". */
export function diaDe(fh: FechaHora): Fecha {
  const p = partes(fh);
  return `${p.anio}-${dos(p.mes)}-${dos(p.dia)}`;
}

/** Para <input type="datetime-local">: "2026-11-12T14:00". */
export function aInputFechaHora(fh: FechaHora): string {
  const p = partes(fh);
  return `${p.anio}-${dos(p.mes)}-${dos(p.dia)}T${dos(p.hora)}:${dos(p.minuto)}`;
}

/** Fin del día para vigencias elegidas con <input type="date">: "2026-11-20" → "2026-11-20T23:59:00". */
export function finDelDia(dia: Fecha): FechaHora {
  return `${diaDe(dia)}T23:59:00`;
}

/** Suma minutos a un valor de <input type="datetime-local">. */
export function sumarMinutos(valorInput: string, minutos: number): string {
  const p = partes(valorInput);
  const d = new Date(Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto + minutos));
  return `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}T${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`;
}

/** Saludo según la hora de Buenos Aires. */
export function saludo(ahora: Date = new Date()): string {
  const h = partesEnBuenosAires(ahora).hora;
  return h < 13 ? "Buen día" : h < 20 ? "Buenas tardes" : "Buenas noches";
}
