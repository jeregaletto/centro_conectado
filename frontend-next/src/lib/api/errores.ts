import type { ErrorResponse } from "@/lib/tipos";

/** Status que usamos cuando no hubo respuesta del servidor (sin red o backend caído). */
export const SIN_CONEXION = 0;

export const MENSAJES = {
  sinConexion: "No hay conexión con el servidor. Revisá el wifi o avisá a tu referente.",
  sinPermiso: "Tu rol no tiene permiso para esta acción",
  sesionVencida: "Tu sesión venció. Ingresá de nuevo.",
  generico: "Algo salió mal. Probá de nuevo en un rato.",
} as const;

/** Error con el formato del GlobalExceptionHandler del backend: { status, mensaje, campos }. */
export class ApiError extends Error {
  readonly status: number;
  readonly mensaje: string;
  readonly campos: Record<string, string> | null;

  constructor(status: number, mensaje: string, campos?: Record<string, string> | null) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.mensaje = mensaje;
    this.campos = campos && Object.keys(campos).length > 0 ? campos : null;
  }
}

export function esApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

function esRegistroDeTextos(x: unknown): x is Record<string, string> {
  return typeof x === "object" && x !== null && Object.values(x).every((v) => typeof v === "string");
}

/** Valida (sin confiar) que un JSON tenga la forma de ErrorResponse. */
export function esErrorResponse(x: unknown): x is Pick<ErrorResponse, "status" | "mensaje"> & Partial<ErrorResponse> {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.status === "number" && typeof r.mensaje === "string" && (r.campos == null || esRegistroDeTextos(r.campos));
}

/** Arma un ApiError a partir del cuerpo de una respuesta con error (JSON o no). */
export function apiErrorDesde(statusHttp: number, cuerpo: unknown): ApiError {
  if (esErrorResponse(cuerpo)) {
    return new ApiError(cuerpo.status, cuerpo.mensaje, cuerpo.campos ?? null);
  }
  return new ApiError(statusHttp, `Error ${statusHttp}`);
}

/**
 * Texto para mostrarle a la persona. Un 403 nunca se muestra como error técnico.
 */
export function mensajeAmigable(e: unknown): string {
  if (!esApiError(e)) return MENSAJES.generico;
  if (e.status === SIN_CONEXION) return MENSAJES.sinConexion;
  if (e.status === 403) return MENSAJES.sinPermiso;
  if (e.status === 401) return MENSAJES.sesionVencida;
  if (e.status >= 500) return MENSAJES.generico;
  return e.mensaje || MENSAJES.generico;
}
