/** Nombres del set único de íconos (componente components/ui/Icono.tsx). */
export const NOMBRES_ICONO = [
  // navegación (mismos nombres que la versión HTML)
  "casa",
  "calendario",
  "check",
  "flechas",
  "buzon",
  "personas",
  "libro",
  "mas",
  "panel",
  "menu",
  // interfaz
  "campana",
  "volver",
  "lugar",
  "reloj",
  "telefono",
  "correo",
  "documento",
  "fijado",
  "salir",
  "llave",
  "descargar",
  "lupa",
  // tareas de puesto (campo `icono` de TareaPuesto)
  "banio",
  "basura",
  "trapeador",
  "silla",
  "jabon",
  "ventana",
  "caja",
  "carro",
  "termometro",
  "pastilla",
] as const;

export type NombreIcono = (typeof NOMBRES_ICONO)[number];

export function esNombreIcono(x: string): x is NombreIcono {
  return (NOMBRES_ICONO as readonly string[]).includes(x);
}

/** Íconos que se pueden elegir para una tarea de puesto, con su etiqueta. */
export const ICONOS_TAREA = {
  banio: "Baño",
  basura: "Basura",
  trapeador: "Limpieza de pisos",
  silla: "Sillas",
  jabon: "Jabón y alcohol",
  ventana: "Ventanas",
  caja: "Depósito",
  carro: "Carro",
  termometro: "Temperatura",
  pastilla: "Medicación",
} as const satisfies Partial<Record<NombreIcono, string>>;
