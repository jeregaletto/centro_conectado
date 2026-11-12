import { qs, type Http } from "../client";
import type { Contador, Notificacion } from "@/lib/tipos";

export const notificaciones = (http: Http) => ({
  listar: (soloNoLeidas = false) => http.pedir<Notificacion[]>("GET", "/notificaciones" + qs({ soloNoLeidas })),
  contador: () => http.pedir<Contador>("GET", "/notificaciones/contador"),
  marcarLeida: (id: number) => http.pedir<Notificacion>("POST", `/notificaciones/${id}/leida`),
  leerTodas: () => http.pedir<unknown>("POST", "/notificaciones/leer-todas"),
});
