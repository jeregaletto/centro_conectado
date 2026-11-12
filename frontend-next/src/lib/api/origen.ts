/**
 * Defensa extra contra CSRF para los Route Handlers que usan la cookie (además de SameSite=Lax):
 * si el navegador manda Origin, tiene que ser este mismo sitio.
 */
export function mismoOrigen(headers: Headers): boolean {
  const origen = headers.get("origin");
  if (!origen) return true;
  try {
    return new URL(origen).host === headers.get("host");
  } catch {
    return false;
  }
}
