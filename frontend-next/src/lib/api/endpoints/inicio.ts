import type { Http } from "../client";
import type { Inicio, ResumenSemanal } from "@/lib/tipos";

export const inicio = (http: Http) => ({
  obtener: () => http.pedir<Inicio>("GET", "/inicio"),
  resumenSemanal: () => http.pedir<ResumenSemanal>("GET", "/resumen-semanal"),
});
