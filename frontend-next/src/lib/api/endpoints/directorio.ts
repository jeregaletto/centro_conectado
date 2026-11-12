import { qs, type Http } from "../client";
import type { AQuienAcudir, Contacto, Sector } from "@/lib/tipos";

export const directorio = (http: Http) => ({
  buscar: (q?: string, sectorId?: number) => http.pedir<Contacto[]>("GET", "/directorio" + qs({ q, sectorId })),
  sectores: () => http.pedir<Sector[]>("GET", "/sectores"),
  aQuienAcudir: () => http.pedir<AQuienAcudir[]>("GET", "/a-quien-acudir"),
});
