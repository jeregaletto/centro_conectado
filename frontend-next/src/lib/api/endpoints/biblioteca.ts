import { qs, type Http } from "../client";
import type { CategoriaDocumento, Documento, FechaHora, GuardarDocumentoRequest } from "@/lib/tipos";

export const biblioteca = (http: Http) => ({
  listar: (f?: { categoria?: CategoriaDocumento; sectorId?: number; q?: string }) =>
    http.pedir<Documento[]>("GET", "/biblioteca" + qs(f)),
  porVencer: () => http.pedir<Documento[]>("GET", "/biblioteca/por-vencer"),
  crear: (datos: GuardarDocumentoRequest) => http.pedir<Documento>("POST", "/biblioteca", datos),
  actualizar: (id: number, datos: GuardarDocumentoRequest) =>
    http.pedir<Documento>("PUT", `/biblioteca/${id}`, datos),
  renovar: (id: number, vigenteHasta?: FechaHora | null) =>
    http.pedir<Documento>("POST", `/biblioteca/${id}/renovar`, { vigenteHasta: vigenteHasta ?? null }),
  eliminar: (id: number) => http.pedir<void>("DELETE", `/biblioteca/${id}`),
});
