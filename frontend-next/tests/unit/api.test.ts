import { describe, expect, it, vi } from "vitest";

import { crearHttp, qs } from "@/lib/api/client";
import { ApiError, MENSAJES, SIN_CONEXION, mensajeAmigable } from "@/lib/api/errores";
import { crearApi } from "@/lib/api";

function respuesta(status: number, cuerpo?: unknown, tipo = "application/json"): Response {
  return new Response(cuerpo === undefined ? null : typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": tipo },
  });
}

describe("qs", () => {
  it("ignora vacíos", () => {
    expect(qs({ a: 1, b: undefined, c: null, d: "", e: false })).toBe("?a=1&e=false");
    expect(qs({})).toBe("");
    expect(qs()).toBe("");
  });
});

describe("crearHttp", () => {
  it("manda método, ruta, JSON y encabezados", async () => {
    const fetchFalso = vi.fn<typeof fetch>(async () => respuesta(200, { id: 1 }));
    const http = crearHttp({ base: "/api/proxy", encabezados: () => ({ Authorization: "Bearer x" }), fetch: fetchFalso });
    const api = crearApi(http);

    await expect(api.pedidos.cambiarEstado(3, "RECHAZADO", "falta stock")).resolves.toEqual({ id: 1 });

    const [url, init] = fetchFalso.mock.calls[0];
    expect(url).toBe("/api/proxy/pedidos/3/estado");
    expect(init?.method).toBe("PATCH");
    expect(init?.body).toBe(JSON.stringify({ estado: "RECHAZADO", comentario: "falta stock" }));
    expect(init?.headers).toMatchObject({ Authorization: "Bearer x", "Content-Type": "application/json" });
  });

  it("204 devuelve undefined", async () => {
    const http = crearHttp({ base: "", fetch: async () => new Response(null, { status: 204 }) });
    await expect(crearApi(http).avisos.eliminar(4)).resolves.toBeUndefined();
  });

  it("convierte el ErrorResponse del backend en ApiError con campos", async () => {
    const http = crearHttp({
      base: "",
      fetch: async () =>
        respuesta(400, { status: 400, mensaje: "Revisá los datos ingresados", campos: { asunto: "no debe estar vacío" } }),
    });
    const err = await crearApi(http).pedidos.detalle(1).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, mensaje: "Revisá los datos ingresados", campos: { asunto: "no debe estar vacío" } });
  });

  it("sin red → status 0 con mensaje de conexión", async () => {
    const http = crearHttp({ base: "", fetch: async () => { throw new TypeError("Failed to fetch"); } });
    const err = await crearApi(http).inicio.obtener().catch((e: unknown) => e);
    expect(err).toMatchObject({ status: SIN_CONEXION });
    expect(mensajeAmigable(err)).toBe(MENSAJES.sinConexion);
  });

  it("el proxy avisa backend caído con status 0 en el cuerpo", async () => {
    const http = crearHttp({ base: "", fetch: async () => respuesta(503, { status: 0, mensaje: MENSAJES.sinConexion }) });
    const err = await crearApi(http).inicio.obtener().catch((e: unknown) => e);
    expect(err).toMatchObject({ status: 0 });
  });

  it("401 llama a alNoAutorizado", async () => {
    const alNoAutorizado = vi.fn();
    const http = crearHttp({ base: "", alNoAutorizado, fetch: async () => respuesta(401, { status: 401, mensaje: "x" }) });
    await expect(crearApi(http).auth.me()).rejects.toBeInstanceOf(ApiError);
    expect(alNoAutorizado).toHaveBeenCalledOnce();
  });

  it("error no JSON", async () => {
    const http = crearHttp({ base: "", fetch: async () => respuesta(502, "Bad gateway", "text/plain") });
    const err = await crearApi(http).inicio.obtener().catch((e: unknown) => e);
    expect(err).toMatchObject({ status: 502, campos: null });
  });
});

describe("mensajeAmigable", () => {
  it("403 nunca se muestra como error técnico", () => {
    expect(mensajeAmigable(new ApiError(403, "Access Denied"))).toBe("Tu rol no tiene permiso para esta acción");
  });
  it("respeta el mensaje del backend en 400/404/409", () => {
    expect(mensajeAmigable(new ApiError(404, "No existe el pedido 9"))).toBe("No existe el pedido 9");
  });
  it("500 y errores que no son de la API → genérico", () => {
    expect(mensajeAmigable(new ApiError(500, "NullPointerException"))).toBe(MENSAJES.generico);
    expect(mensajeAmigable(new Error("x"))).toBe(MENSAJES.generico);
  });
});
