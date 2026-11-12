import type { Http } from "../client";
import type { UsuarioActual } from "@/lib/tipos";

/** El login NO va acá: lo hace el Route Handler /api/session (setea la cookie HttpOnly). */
export const auth = (http: Http) => ({
  me: () => http.pedir<UsuarioActual>("GET", "/auth/me"),
  cambiarPassword: (actual: string, nueva: string) =>
    http.pedir<UsuarioActual>("POST", "/auth/cambiar-password", { actual, nueva }),
});
