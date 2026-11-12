import { NextResponse, type NextRequest } from "next/server";

import { MENSAJES } from "@/lib/api/errores";
import { mismoOrigen } from "@/lib/api/origen";
import { BACKEND_URL } from "@/lib/api/servidor";
import { COOKIE_TOKEN } from "@/lib/sesion";

/**
 * Proxy del navegador al backend: /api/proxy/pedidos/3 → BACKEND_URL/api/pedidos/3
 * Lee el JWT de la cookie HttpOnly y lo manda en Authorization. El token nunca llega al JS del cliente.
 * La autorización real la hace el backend: acá solo se reenvía.
 */

const ENCABEZADOS_RESPUESTA = ["content-type", "content-disposition", "cache-control"];
const SEGMENTO_VALIDO = /^[A-Za-z0-9._~-]+$/;

function error(status: number, mensaje: string, statusHttp = status) {
  return NextResponse.json({ status, mensaje, campos: null }, { status: statusHttp });
}

async function reenviar(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">): Promise<Response> {
  const metodo = request.method.toUpperCase();
  if (metodo !== "GET" && !mismoOrigen(request.headers)) return error(403, MENSAJES.sinPermiso);

  const { path } = await ctx.params;
  // Segmentos ya decodificados por Next: solo caracteres seguros, nada de "..", "/" o "%".
  if (path.length === 0 || path.some((s) => !SEGMENTO_VALIDO.test(s) || s === "." || s === "..")) {
    return error(400, "Ruta inválida");
  }

  const token = request.cookies.get(COOKIE_TOKEN)?.value;
  if (!token) return error(401, MENSAJES.sesionVencida);

  const destino = `${BACKEND_URL}/api/${path.join("/")}${request.nextUrl.search}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: request.headers.get("accept") ?? "application/json",
  };
  const tipo = request.headers.get("content-type");
  if (tipo) headers["Content-Type"] = tipo;

  let res: Response;
  try {
    res = await fetch(destino, {
      method: metodo,
      headers,
      body: metodo === "GET" || metodo === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return error(0, MENSAJES.sinConexion, 503);
  }

  const salidaHeaders = new Headers();
  for (const h of ENCABEZADOS_RESPUESTA) {
    const v = res.headers.get(h);
    if (v) salidaHeaders.set(h, v);
  }
  const cuerpo = res.status === 204 ? null : await res.arrayBuffer();
  const salida = new NextResponse(cuerpo, { status: res.status, headers: salidaHeaders });
  // Token vencido o inválido: lo sacamos para que el próximo pedido vaya directo al login.
  if (res.status === 401) salida.cookies.set({ name: COOKIE_TOKEN, value: "", httpOnly: true, path: "/", maxAge: 0 });
  return salida;
}

export const GET = reenviar;
export const POST = reenviar;
export const PUT = reenviar;
export const PATCH = reenviar;
export const DELETE = reenviar;
