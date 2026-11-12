import { crearHttp } from "@/lib/api/client";
import type { UsuarioActual } from "@/lib/tipos";
import type { LoginForm } from "./schema";

/** Habla con el Route Handler /api/session (no con el proxy): es el único que toca la cookie. */
const httpSesion = crearHttp({ base: "/api" });

export function iniciarSesion(datos: LoginForm): Promise<{ usuario: UsuarioActual }> {
  return httpSesion.pedir<{ usuario: UsuarioActual }>("POST", "/session", datos);
}

export function cerrarSesion(): Promise<void> {
  return httpSesion.pedir<void>("DELETE", "/session");
}
