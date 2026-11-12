import { qs, type Http } from "../client";
import type { EnviarMensajeRequest, EstadoMensaje, MensajeBuzon } from "@/lib/tipos";

export const buzon = (http: Http) => ({
  enviar: (datos: EnviarMensajeRequest) => http.pedir<MensajeBuzon>("POST", "/buzon", datos),
  mios: () => http.pedir<MensajeBuzon[]>("GET", "/buzon/mios"),
  seguimiento: (codigo: string) =>
    http.pedir<MensajeBuzon>("GET", `/buzon/seguimiento/${encodeURIComponent(codigo)}`),
  gestion: (estado?: EstadoMensaje) => http.pedir<MensajeBuzon[]>("GET", "/buzon/gestion" + qs({ estado })),
  responder: (id: number, respuesta: string) =>
    http.pedir<MensajeBuzon>("POST", `/buzon/${id}/responder`, { respuesta }),
  cambiarEstado: (id: number, estado: EstadoMensaje) =>
    http.pedir<MensajeBuzon>("PATCH", `/buzon/${id}/estado`, { estado }),
});
