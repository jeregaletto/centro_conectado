export const RUTA_POR_DEFECTO = "/inicio";

const ORIGEN_FICTICIO = "http://centro.invalid";

/**
 * Valida un `volver` para redirigir después del login.
 * Solo rutas relativas propias: empieza con "/", no con "//" ni "/\", sin protocolo ni caracteres de control.
 * Si no pasa, devuelve la ruta por defecto. Evita redirecciones abiertas (?volver=https://sitio-malo).
 */
export function rutaSegura(volver: string | null | undefined, porDefecto: string = RUTA_POR_DEFECTO): string {
  if (typeof volver !== "string" || volver.length === 0 || volver.length > 2000) return porDefecto;
  if (!volver.startsWith("/") || volver.startsWith("//")) return porDefecto;
  if (volver.includes("\\")) return porDefecto;
  if (/[\u0000-\u001f\u007f\s]/.test(volver)) return porDefecto;
  // Lo mismo, pero ya decodificado: "%0d%0a", "%5c" (\) o "%2f%2f" (//) tampoco pasan.
  let decodificado: string;
  try {
    decodificado = decodeURIComponent(volver);
  } catch {
    return porDefecto;
  }
  if (/[\u0000-\u001f\u007f\\]/.test(decodificado) || decodificado.startsWith("//")) return porDefecto;

  let url: URL;
  try {
    url = new URL(volver, ORIGEN_FICTICIO);
  } catch {
    return porDefecto;
  }
  if (url.origin !== ORIGEN_FICTICIO) return porDefecto;
  // No volver al login ni a rutas internas de la API.
  if (/^\/(login|api)(\/|$)/.test(url.pathname)) return porDefecto;
  return url.pathname + url.search + url.hash;
}
