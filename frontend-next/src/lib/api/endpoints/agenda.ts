import { qs, type Http } from "../client";
import type { Evento, Fecha, GuardarEventoRequest } from "@/lib/tipos";

export const agenda = (http: Http) => ({
  /** El backend acepta rangos de hasta 92 días; sin parámetros trae de hoy a 7 días. */
  listar: (desde?: Fecha, hasta?: Fecha) => http.pedir<Evento[]>("GET", "/agenda" + qs({ desde, hasta })),
  hoy: () => http.pedir<Evento[]>("GET", "/agenda/hoy"),
  obtener: (id: number) => http.pedir<Evento>("GET", `/agenda/${id}`),
  crear: (datos: GuardarEventoRequest) => http.pedir<Evento>("POST", "/agenda", datos),
  actualizar: (id: number, datos: GuardarEventoRequest) => http.pedir<Evento>("PUT", `/agenda/${id}`, datos),
  eliminar: (id: number) => http.pedir<void>("DELETE", `/agenda/${id}`),
  /** Archivo .ics. En el navegador pasa por el proxy, que agrega el token (un enlace directo no lo mandaría). */
  ics: (id: number) => http.descargar(`/agenda/${id}/ics`),
});
