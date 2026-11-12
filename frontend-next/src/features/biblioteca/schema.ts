import { z } from "zod";

import { M } from "@/features/comun/mensajes";

/** GuardarDocumentoRequest. La URL tiene el mismo patrón y mensaje que el backend. */
export const documentoSchema = z.object({
  titulo: z.string().trim().min(1, M.vacio).max(150, M.tamano(0, 150)),
  descripcion: z.string().trim().max(500, M.tamano(0, 500)).nullable(),
  categoria: z.enum(["PROTOCOLO", "MANUAL_INDUCCION", "REGLAMENTO", "INSTITUCIONAL", "KIT_BIENVENIDA"], { error: M.nulo }),
  url: z
    .string()
    .trim()
    .min(1, M.vacio)
    .max(500, M.tamano(0, 500))
    .regex(/^(https:\/\/|\/).*/, "La URL tiene que empezar con https:// o /"),
  sectorId: z.number().int().positive().nullable(),
  version: z.string().trim().max(20, M.tamano(0, 20)).nullable(),
  vigenteHasta: z.string().nullable(),
});
export type DocumentoForm = z.infer<typeof documentoSchema>;
