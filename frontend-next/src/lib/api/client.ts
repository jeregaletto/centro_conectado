import { ApiError, MENSAJES, SIN_CONEXION, apiErrorDesde } from "./errores";

export type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Consulta = Record<string, string | number | boolean | null | undefined>;

/**
 * Transporte HTTP. Hay dos implementaciones con la misma interfaz:
 * - Navegador (`httpCliente`, acá): va a /api/proxy/*, que agrega el token desde la cookie HttpOnly.
 * - Servidor (`httpServidor`, en servidor.ts): va directo al backend leyendo la cookie con cookies().
 * Las rutas siempre son relativas a /api del backend: "/inicio", "/pedidos/3".
 */
export interface Http {
  pedir<T>(metodo: Metodo, ruta: string, cuerpo?: unknown): Promise<T>;
  descargar(ruta: string): Promise<Blob>;
}

/** Arma "?a=1&b=x" ignorando undefined, null y "". */
export function qs(consulta?: Consulta): string {
  if (!consulta) return "";
  const pares = Object.entries(consulta).filter(
    (par): par is [string, string | number | boolean] => par[1] !== undefined && par[1] !== null && par[1] !== "",
  );
  if (pares.length === 0) return "";
  return "?" + new URLSearchParams(pares.map(([k, v]) => [k, String(v)])).toString();
}

interface OpcionesHttp {
  base: string;
  encabezados?: () => Promise<Record<string, string>> | Record<string, string>;
  /** Se llama ante un 401 antes de lanzar el error (en el navegador: ir al login). */
  alNoAutorizado?: () => void;
  fetch?: typeof fetch;
}

export function crearHttp(op: OpcionesHttp): Http {
  const hacerFetch = op.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));

  async function enviar(metodo: Metodo, ruta: string, cuerpo: unknown, aceptar: string): Promise<Response> {
    const headers: Record<string, string> = { Accept: aceptar, ...(op.encabezados ? await op.encabezados() : {}) };
    if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
    let res: Response;
    try {
      res = await hacerFetch(op.base + ruta, {
        method: metodo,
        headers,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        cache: "no-store",
      });
    } catch {
      throw new ApiError(SIN_CONEXION, MENSAJES.sinConexion);
    }
    if (res.ok) return res;

    const tipo = res.headers.get("Content-Type") ?? "";
    let datos: unknown = null;
    try {
      datos = tipo.includes("json") ? await res.json() : await res.text();
    } catch {
      datos = null;
    }
    const error = apiErrorDesde(res.status, datos);
    if (error.status === 401) op.alNoAutorizado?.();
    throw error;
  }

  return {
    async pedir<T>(metodo: Metodo, ruta: string, cuerpo?: unknown): Promise<T> {
      const res = await enviar(metodo, ruta, cuerpo, "application/json");
      if (res.status === 204) return undefined as T;
      const tipo = res.headers.get("Content-Type") ?? "";
      const datos: unknown = tipo.includes("json") ? await res.json() : await res.text();
      return datos as T;
    },
    async descargar(ruta: string): Promise<Blob> {
      const res = await enviar("GET", ruta, undefined, "*/*");
      return res.blob();
    },
  };
}

/** Navegador: todas las llamadas pasan por el proxy de Next, que pone el token. */
export const httpCliente: Http = crearHttp({
  base: "/api/proxy",
  alNoAutorizado: () => {
    if (typeof window === "undefined") return;
    const volver = encodeURIComponent(window.location.pathname + window.location.search);
    // Recarga completa a propósito: estamos fuera de React y hay que descartar todo el estado de la sesión.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?vencida=1&volver=${volver}`);
  },
});
