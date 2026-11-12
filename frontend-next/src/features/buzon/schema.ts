import { z } from "zod";

import { M } from "@/features/comun/mensajes";

/** EnviarMensajeRequest */
export const mensajeBuzonSchema = z.object({
  tipo: z.enum(["CONSULTA", "SUGERENCIA", "RECLAMO"], { error: M.nulo }),
  asunto: z.string().trim().min(1, M.vacio).max(150, M.tamano(0, 150)),
  cuerpo: z.string().trim().min(1, M.vacio).max(4000, M.tamano(0, 4000)),
  anonimo: z.boolean(),
});

export const codigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{4,20}$/, "Revisá el código: son letras y números, sin espacios"),
});

/** ResponderMensajeRequest */
export const respuestaSchema = z.object({
  respuesta: z.string().trim().min(1, M.vacio).max(4000, M.tamano(0, 4000)),
});
