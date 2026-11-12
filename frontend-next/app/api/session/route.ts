import { NextResponse, type NextRequest } from "next/server";

import { MENSAJES } from "@/lib/api/errores";
import { mismoOrigen } from "@/lib/api/origen";
import { BACKEND_URL } from "@/lib/api/servidor";
import { loginSchema } from "@/features/login/schema";
import { COOKIE_TOKEN } from "@/lib/sesion";
import type { LoginResponse } from "@/lib/tipos";

/**
 * POST /api/session  → login: llama a /api/auth/login del backend y guarda el JWT en una cookie HttpOnly.
 *                       Responde { usuario } (el token NUNCA vuelve al navegador).
 * DELETE /api/session → logout: borra la cookie.
 */

function error(status: number, mensaje: string, campos: Record<string, string> | null = null, statusHttp = status) {
  return NextResponse.json({ status, mensaje, campos }, { status: statusHttp });
}

function esLoginResponse(x: unknown): x is LoginResponse {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.token === "string" && typeof r.expiraEn === "string" && typeof r.usuario === "object" && r.usuario !== null;
}

export async function POST(request: NextRequest) {
  if (!mismoOrigen(request.headers)) return error(403, MENSAJES.sinPermiso);

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return error(400, "Revisá los datos ingresados");
  }
  const datos = loginSchema.safeParse(cuerpo);
  if (!datos.success) {
    const campos: Record<string, string> = {};
    for (const issue of datos.error.issues) {
      const campo = String(issue.path[0] ?? "");
      if (campo && !campos[campo]) campos[campo] = issue.message;
    }
    return error(400, "Revisá los datos ingresados", campos);
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ usuario: datos.data.usuario, password: datos.data.password }),
      cache: "no-store",
    });
  } catch {
    // Backend caído: status 0 en el cuerpo para que el cliente lo trate como "sin conexión".
    return error(0, MENSAJES.sinConexion, null, 503);
  }

  const respuesta: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    // Reenviamos el ErrorResponse del backend tal cual (credenciales, bloqueo por intentos, etc.).
    return NextResponse.json(respuesta ?? { status: res.status, mensaje: MENSAJES.generico, campos: null }, {
      status: res.status,
    });
  }
  if (!esLoginResponse(respuesta)) return error(502, MENSAJES.generico);

  const salida = NextResponse.json({ usuario: respuesta.usuario });
  salida.cookies.set({
    name: COOKIE_TOKEN,
    value: respuesta.token,
    httpOnly: true,
    // Secure en producción (HTTPS). COOKIE_SECURE=false solo para probar el build desde el celular por http://IP.
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // "Mantener la sesión": la cookie dura lo mismo que el JWT (expiraEn).
    // Sin tildar: cookie de sesión, se borra al cerrar el navegador (tablet compartida).
    // En los dos casos el backend rechaza el token cuando vence.
    ...(datos.data.recordar ? { expires: new Date(respuesta.expiraEn) } : {}),
  });
  return salida;
}

export async function DELETE(request: NextRequest) {
  if (!mismoOrigen(request.headers)) return error(403, MENSAJES.sinPermiso);
  const salida = new NextResponse(null, { status: 204 });
  salida.cookies.set({ name: COOKIE_TOKEN, value: "", httpOnly: true, path: "/", maxAge: 0 });
  return salida;
}

