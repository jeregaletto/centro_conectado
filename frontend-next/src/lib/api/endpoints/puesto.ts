import { qs, type Http } from "../client";
import type { AvanceUsuario, GuardarTareaRequest, MiPuesto, TareaPuesto } from "@/lib/tipos";

export const puesto = (http: Http) => ({
  miPuesto: () => http.pedir<MiPuesto>("GET", "/mi-puesto"),
  /** Tildar: devuelve la pantalla completa actualizada. */
  completar: (tareaId: number) => http.pedir<MiPuesto>("POST", `/mi-puesto/tareas/${tareaId}/completar`),
  /** Destildar: devuelve la pantalla completa actualizada. */
  desmarcar: (tareaId: number) => http.pedir<MiPuesto>("DELETE", `/mi-puesto/tareas/${tareaId}/completar`),
  tareasSector: (sectorId?: number) => http.pedir<TareaPuesto[]>("GET", "/puesto/tareas" + qs({ sectorId })),
  avanceSector: (sectorId?: number) => http.pedir<AvanceUsuario[]>("GET", "/puesto/avance" + qs({ sectorId })),
  crearTarea: (datos: GuardarTareaRequest) => http.pedir<TareaPuesto>("POST", "/puesto/tareas", datos),
  actualizarTarea: (id: number, datos: GuardarTareaRequest) =>
    http.pedir<TareaPuesto>("PUT", `/puesto/tareas/${id}`, datos),
  eliminarTarea: (id: number) => http.pedir<void>("DELETE", `/puesto/tareas/${id}`),
});
