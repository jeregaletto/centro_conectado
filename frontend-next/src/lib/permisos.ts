import type { NombreIcono } from "@/lib/iconos";
import type { Permiso, Rol, UsuarioActual } from "@/lib/tipos";

/**
 * Qué ve cada rol. Una sola fuente de verdad para toda la app.
 * Esto decide qué botones mostrar; la seguridad real la aplica el backend.
 */

export type ClavePantalla =
  | "inicio"
  | "agenda"
  | "miPuesto"
  | "pedidos"
  | "buzon"
  | "quien"
  | "biblioteca"
  | "publicar"
  | "gestion"
  | "mas"
  | "notificaciones";

export interface Pantalla {
  etiqueta: string;
  href: string;
  icono: NombreIcono;
  /** Texto corto para el menú "Más". */
  ayuda?: string;
}

export const PANTALLAS: Record<ClavePantalla, Pantalla> = {
  inicio: { etiqueta: "Inicio", href: "/inicio", icono: "casa" },
  agenda: { etiqueta: "Agenda", href: "/agenda", icono: "calendario" },
  miPuesto: { etiqueta: "Mi puesto", href: "/mi-puesto", icono: "check", ayuda: "Tus tareas de hoy" },
  pedidos: { etiqueta: "Pedidos", href: "/pedidos", icono: "flechas" },
  buzon: { etiqueta: "Buzón", href: "/buzon", icono: "buzon" },
  quien: { etiqueta: "Quién es quién", href: "/quien-es-quien", icono: "personas", ayuda: "Contactos y a quién acudir" },
  biblioteca: { etiqueta: "Biblioteca", href: "/biblioteca", icono: "libro", ayuda: "Protocolos y manuales" },
  publicar: { etiqueta: "Publicar", href: "/publicar", icono: "mas", ayuda: "Avisos y eventos" },
  gestion: { etiqueta: "Gestión", href: "/gestion", icono: "panel", ayuda: "Buzón, tareas, pedidos y usuarios" },
  mas: { etiqueta: "Más", href: "/mas", icono: "menu" },
  notificaciones: { etiqueta: "Notificaciones", href: "/notificaciones", icono: "campana" },
};

/** Color de cada rol (las "líneas de piso" del login). */
export const COLOR_ROL: Record<Rol, string> = {
  DIRECCION: "#1F4E8C",
  COMUNICACION: "#6B4BA8",
  REFERENTE: "#0E7C66",
  PROFESIONAL: "#B83A4B",
  ADMINISTRATIVO: "#C46A12",
  MAESTRANZA: "#E0B400",
};

type ConPermisos = Pick<UsuarioActual, "permisos"> | null | undefined;

export function tiene(u: ConPermisos, permiso: Permiso): boolean {
  return !!u && Array.isArray(u.permisos) && u.permisos.includes(permiso);
}

export function tieneAlguno(u: ConPermisos, permisos: readonly Permiso[]): boolean {
  return permisos.some((p) => tiene(u, p));
}

export const PERMISOS_PUBLICAR = ["PUBLICAR_GENERAL", "PUBLICAR_SECTOR"] as const satisfies readonly Permiso[];

export function puedePublicar(u: ConPermisos): boolean {
  return tieneAlguno(u, PERMISOS_PUBLICAR);
}

export type SeccionGestion = "buzon" | "tareas" | "pedidos" | "usuarios";

export const ETIQUETA_SECCION: Record<SeccionGestion, string> = {
  buzon: "Buzón",
  tareas: "Tareas",
  pedidos: "Pedidos",
  usuarios: "Usuarios",
};

/** Pestañas de Gestión que le corresponden a cada persona, en orden. */
export function seccionesGestion(u: ConPermisos): SeccionGestion[] {
  const s: SeccionGestion[] = [];
  if (tiene(u, "GESTIONAR_BUZON")) s.push("buzon");
  if (tieneAlguno(u, ["GESTIONAR_TAREAS_GENERAL", "GESTIONAR_TAREAS_SECTOR"])) s.push("tareas");
  if (tiene(u, "VER_TODOS_LOS_PEDIDOS")) s.push("pedidos");
  if (tiene(u, "GESTIONAR_USUARIOS")) s.push("usuarios");
  return s;
}

export function puedeGestionar(u: ConPermisos): boolean {
  return seccionesGestion(u).length > 0;
}

type ConVista = Pick<UsuarioActual, "vista" | "permisos"> | null | undefined;

/** Barra inferior. Maestranza (vista SIMPLE): 4 botones grandes, sin submenús. */
export function menuPara(u: ConVista): ClavePantalla[] {
  if (!u) return [];
  if (u.vista === "SIMPLE") return ["inicio", "miPuesto", "pedidos", "buzon"];
  return ["inicio", "agenda", "pedidos", "buzon", "mas"];
}

/** Lo que va dentro de "Más" según permisos. */
export function menuMas(u: ConPermisos): ClavePantalla[] {
  const items: ClavePantalla[] = ["miPuesto", "quien", "biblioteca"];
  if (puedePublicar(u)) items.unshift("publicar");
  if (puedeGestionar(u)) items.unshift("gestion");
  return items;
}

/**
 * Pestaña de la barra que se marca como activa para una ruta.
 * Lo que no está en la barra (Biblioteca, Gestión...) marca "Más" si la barra lo tiene.
 */
export function pestanaActiva(pathname: string, u: ConVista): ClavePantalla | null {
  const barra = menuPara(u);
  const clave = (Object.keys(PANTALLAS) as ClavePantalla[]).find((k) => {
    const href = PANTALLAS[k].href;
    return pathname === href || pathname.startsWith(href + "/");
  });
  if (!clave) return null;
  if (barra.includes(clave)) return clave;
  if (clave === "notificaciones") return null;
  return barra.includes("mas") ? "mas" : null;
}

/** Adónde va cada persona al entrar. */
export function destinoInicial(u: Pick<UsuarioActual, "debeCambiarPassword"> | null | undefined): string {
  if (u?.debeCambiarPassword) return "/login?cambiar=1";
  return PANTALLAS.inicio.href;
}
