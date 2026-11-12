import type { Permiso, Rol } from "@/lib/tipos";

/** Mismos usuarios que carga el DataSeeder del backend (perfil dev). Solo para el modo demo. */
export const USUARIOS_DEMO: readonly {
  usuario: string;
  rol: Rol;
  etiqueta: string;
  nombre: string;
  apellido: string;
  puesto: string;
  sector: string;
}[] = [
  { usuario: "direccion", rol: "DIRECCION", etiqueta: "Dirección", nombre: "Laura", apellido: "Méndez", puesto: "Directora", sector: "Dirección" },
  { usuario: "comunicacion", rol: "COMUNICACION", etiqueta: "Calidad y comunicación", nombre: "Pablo", apellido: "Ríos", puesto: "Responsable de Calidad", sector: "Calidad y Comunicación" },
  { usuario: "referente.enf", rol: "REFERENTE", etiqueta: "Referente de sector", nombre: "Marta", apellido: "Gómez", puesto: "Jefa de Enfermería", sector: "Enfermería" },
  { usuario: "enfermero", rol: "PROFESIONAL", etiqueta: "Profesional", nombre: "Diego", apellido: "Sosa", puesto: "Enfermero", sector: "Enfermería" },
  { usuario: "administracion", rol: "ADMINISTRATIVO", etiqueta: "Administrativo", nombre: "Carla", apellido: "Núñez", puesto: "Administrativa", sector: "Administración" },
  { usuario: "maestranza", rol: "MAESTRANZA", etiqueta: "Maestranza", nombre: "Rosa", apellido: "Benítez", puesto: "Auxiliar de limpieza", sector: "Maestranza" },
];

const TODOS: Permiso[] = [
  "PUBLICAR_GENERAL",
  "PUBLICAR_SECTOR",
  "VER_LECTURAS",
  "GESTIONAR_TAREAS_GENERAL",
  "GESTIONAR_TAREAS_SECTOR",
  "GESTIONAR_BUZON",
  "GESTIONAR_BIBLIOTECA",
  "GESTIONAR_USUARIOS",
  "VER_TODOS_LOS_PEDIDOS",
];

/** Espejo de Rol.java, solo para la vista previa sin servidor. */
export const PERMISOS_DEMO: Record<Rol, Permiso[]> = {
  DIRECCION: TODOS,
  COMUNICACION: TODOS,
  REFERENTE: ["PUBLICAR_SECTOR", "GESTIONAR_TAREAS_SECTOR", "VER_LECTURAS"],
  PROFESIONAL: [],
  ADMINISTRATIVO: [],
  MAESTRANZA: [],
};

export const QUE_PUEDE: Record<Permiso, string> = {
  PUBLICAR_GENERAL: "Publicar avisos y eventos para todo el Centro",
  PUBLICAR_SECTOR: "Publicar avisos y eventos para tu sector",
  VER_LECTURAS: "Ver quién leyó cada aviso importante",
  GESTIONAR_TAREAS_GENERAL: "Armar el checklist de tareas de cualquier sector",
  GESTIONAR_TAREAS_SECTOR: "Armar el checklist de tareas de tu sector y ver el avance",
  GESTIONAR_BUZON: "Responder el buzón dentro de las 72 h",
  GESTIONAR_BIBLIOTECA: "Publicar y renovar protocolos y manuales",
  GESTIONAR_USUARIOS: "Dar de alta personas y asignar referentes",
  VER_TODOS_LOS_PEDIDOS: "Ver los pedidos entre todas las áreas",
};

export const BASE_COMPLETA = [
  "Leer y confirmar los avisos fijados",
  "Ver la agenda y agregar eventos a tu calendario",
  "Hacer pedidos e interconsultas a otras áreas, con plazo",
  "Escribir al buzón, con opción anónima",
];
