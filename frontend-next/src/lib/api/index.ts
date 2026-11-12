import { httpCliente, type Http } from "./client";
import { admin } from "./endpoints/admin";
import { agenda } from "./endpoints/agenda";
import { auth } from "./endpoints/auth";
import { avisos } from "./endpoints/avisos";
import { biblioteca } from "./endpoints/biblioteca";
import { buzon } from "./endpoints/buzon";
import { directorio } from "./endpoints/directorio";
import { inicio } from "./endpoints/inicio";
import { notificaciones } from "./endpoints/notificaciones";
import { pedidos } from "./endpoints/pedidos";
import { puesto } from "./endpoints/puesto";

/** Todos los endpoints sobre un transporte (navegador o servidor). */
export function crearApi(http: Http) {
  return {
    auth: auth(http),
    inicio: inicio(http),
    avisos: avisos(http),
    agenda: agenda(http),
    notificaciones: notificaciones(http),
    puesto: puesto(http),
    pedidos: pedidos(http),
    buzon: buzon(http),
    directorio: directorio(http),
    biblioteca: biblioteca(http),
    admin: admin(http),
  };
}

export type Api = ReturnType<typeof crearApi>;

/** Para Client Components: pasa por /api/proxy. En Server Components usá `apiServidor()` de servidor.ts. */
export const api: Api = crearApi(httpCliente);
