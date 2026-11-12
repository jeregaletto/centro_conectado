import { z } from "zod";

import { M } from "@/features/comun/mensajes";

export const MENSAJE_SOLO_TU_SECTOR = "Como referente solo podés publicar para tu sector";

/**
 * A quién puede dirigir un contenido quien publica (espejo de AlcancePublicacionService del backend):
 * con PUBLICAR_GENERAL, cualquier sector o todo el Centro (lista vacía); el referente, solo su sector.
 */
export interface Alcance {
  general: boolean;
  sectorPropio: number;
}

function sectores(alcance: Alcance) {
  return z
    .array(z.number().int().positive())
    .refine((ids) => alcance.general || ids.every((id) => id === alcance.sectorPropio), MENSAJE_SOLO_TU_SECTOR);
}

/** GuardarAvisoRequest */
export function avisoSchema(alcance: Alcance) {
  return z.object({
    titulo: z.string().trim().min(1, M.vacio).max(150, M.tamano(0, 150)),
    cuerpo: z.string().trim().min(1, M.vacio).max(4000, M.tamano(0, 4000)),
    tipo: z.enum(["NOVEDAD", "CAMBIO_HORARIO", "URGENTE"], { error: M.nulo }),
    fijado: z.boolean(),
    requiereLectura: z.boolean(),
    vigenteHasta: z.string().nullable(),
    sectorIds: sectores(alcance),
  });
}

/** GuardarEventoRequest */
export function eventoSchema(alcance: Alcance) {
  return z
    .object({
      titulo: z.string().trim().min(1, M.vacio).max(150, M.tamano(0, 150)),
      descripcion: z.string().trim().max(2000, M.tamano(0, 2000)).nullable(),
      tipo: z.enum(["EVENTO", "CAPACITACION", "REUNION"], { error: M.nulo }),
      lugar: z.string().trim().max(150, M.tamano(0, 150)).nullable(),
      inicio: z.string({ error: M.nulo }).min(1, M.nulo),
      fin: z.string({ error: M.nulo }).min(1, M.nulo),
      recordatorioMinutos: z.number().int().min(5, M.minimo(5)).max(10080, M.maximo(10080)).nullable(),
      sectorIds: sectores(alcance),
    })
    .refine((v) => !v.inicio || !v.fin || v.fin > v.inicio, {
      path: ["fin"],
      message: "El evento tiene que terminar después de empezar",
    });
}
