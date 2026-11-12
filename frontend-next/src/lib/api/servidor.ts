import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_TOKEN } from "@/lib/sesion";
import type { UsuarioActual } from "@/lib/tipos";
import { crearHttp, type Http } from "./client";
import { esApiError, mensajeAmigable } from "./errores";
import { crearApi, type Api } from "./index";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

/** Servidor: llama directo al backend con el token de la cookie. El token nunca sale de acá. */
export const httpServidor: Http = crearHttp({
  base: `${BACKEND_URL}/api`,
  encabezados: async (): Promise<Record<string, string>> => {
    const token = (await cookies()).get(COOKIE_TOKEN)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export function apiServidor(): Api {
  return crearApi(httpServidor);
}

/** Usuario de la sesión. Si el token no sirve, al login. */
export async function usuarioActual(): Promise<UsuarioActual> {
  try {
    return await apiServidor().auth.me();
  } catch (e) {
    if (esApiError(e) && e.status === 401) redirect("/login?vencida=1");
    throw e;
  }
}

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string };

/**
 * Carga datos para un Server Component sin romper la página: un error se muestra como mensaje.
 * Un 401 manda al login (la cookie está vencida o es inválida).
 */
export async function cargar<T>(consulta: (api: Api) => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, datos: await consulta(apiServidor()) };
  } catch (e) {
    if (esApiError(e)) {
      if (e.status === 401) redirect("/login?vencida=1");
      return { ok: false, error: mensajeAmigable(e) };
    }
    throw e;
  }
}
