import { qs, type Http } from "../client";
import type { Aviso, FechaHora, GuardarAvisoRequest, Lecturas, TipoAviso } from "@/lib/tipos";

export const avisos = (http: Http) => ({
  listar: (f?: { tipo?: TipoAviso; soloNoLeidos?: boolean }) => http.pedir<Aviso[]>("GET", "/avisos" + qs(f)),
  obtener: (id: number) => http.pedir<Aviso>("GET", `/avisos/${id}`),
  marcarLeido: (id: number) => http.pedir<Aviso>("POST", `/avisos/${id}/leido`),
  crear: (datos: GuardarAvisoRequest) => http.pedir<Aviso>("POST", "/avisos", datos),
  actualizar: (id: number, datos: GuardarAvisoRequest) => http.pedir<Aviso>("PUT", `/avisos/${id}`, datos),
  renovar: (id: number, vigenteHasta?: FechaHora | null) =>
    http.pedir<Aviso>("POST", `/avisos/${id}/renovar`, { vigenteHasta: vigenteHasta ?? null }),
  eliminar: (id: number) => http.pedir<void>("DELETE", `/avisos/${id}`),
  lecturas: (id: number) => http.pedir<Lecturas>("GET", `/avisos/${id}/lecturas`),
  porVencer: () => http.pedir<Aviso[]>("GET", "/avisos/por-vencer"),
  /** Lo que la persona administra: todo lo vigente con PUBLICAR_GENERAL; el referente, lo suyo. */
  publicados: () => http.pedir<Aviso[]>("GET", "/avisos/publicados"),
});
