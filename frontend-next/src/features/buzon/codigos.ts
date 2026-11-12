import { CLAVE_CODIGOS_BUZON } from "@/lib/sesion";

/**
 * Códigos de seguimiento de los mensajes anónimos enviados desde ESTE dispositivo.
 * Es lo único que la app guarda en localStorage: los anónimos no quedan vinculados al usuario en el backend.
 */
export function codigosGuardados(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(CLAVE_CODIGOS_BUZON) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^[A-Z0-9]{4,20}$/.test(x)) : [];
  } catch {
    return [];
  }
}

export function guardarCodigo(codigo: string): void {
  try {
    const todos = [codigo, ...codigosGuardados().filter((c) => c !== codigo)].slice(0, 50);
    localStorage.setItem(CLAVE_CODIGOS_BUZON, JSON.stringify(todos));
  } catch {
    // Navegación privada o sin espacio: el código igual se muestra en pantalla para anotarlo.
  }
}
