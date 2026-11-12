import type { z } from "zod";

/** Errores de Zod con la misma forma que `campos` del backend: { campo: mensaje }. Uno por campo. */
export function erroresDeZod(error: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = issue.path.length > 0 ? String(issue.path[0]) : "";
    if (!campos[campo]) campos[campo] = issue.message;
  }
  return campos;
}

/**
 * Reparte `campos` entre los que tienen un input en el formulario (van debajo de cada uno)
 * y los que no (se suman al mensaje general arriba del formulario).
 */
export function repartirCampos(
  campos: Record<string, string>,
  conocidos: readonly string[],
): { porCampo: Record<string, string>; sueltos: string[] } {
  const porCampo: Record<string, string> = {};
  const sueltos: string[] = [];
  for (const [campo, mensaje] of Object.entries(campos)) {
    if (conocidos.includes(campo)) porCampo[campo] = mensaje;
    else sueltos.push(mensaje);
  }
  return { porCampo, sueltos };
}

/** Texto de un FormData: recortado; null si viene vacío. */
export function texto(datos: FormData, campo: string): string {
  const v = datos.get(campo);
  return typeof v === "string" ? v.trim() : "";
}

export function textoONull(datos: FormData, campo: string): string | null {
  return texto(datos, campo) || null;
}

export function marcado(datos: FormData, campo: string): boolean {
  return datos.get(campo) === "on" || datos.get(campo) === "true";
}

/** Números elegidos en un grupo de checkboxes con el mismo name. */
export function numeros(datos: FormData, campo: string): number[] {
  return datos
    .getAll(campo)
    .map((v) => (typeof v === "string" ? Number(v) : NaN))
    .filter((n) => Number.isInteger(n));
}
