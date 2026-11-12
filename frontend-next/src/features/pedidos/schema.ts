import { z } from "zod";

import { M } from "@/features/comun/mensajes";

/** CrearPedidoRequest. Sin campos para datos de pacientes: solo asunto y detalle libres, con aviso en pantalla. */
export const crearPedidoSchema = z.object({
  tipo: z.enum(["PEDIDO", "INTERCONSULTA"], { error: M.nulo }),
  sectorDestinoId: z.number({ error: M.nulo }).int().positive(M.nulo),
  asunto: z.string().trim().min(1, M.vacio).max(150, M.tamano(0, 150)),
  detalle: z.string().trim().min(1, M.vacio).max(2000, M.tamano(0, 2000)),
  prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]).default("MEDIA"),
});
export type CrearPedidoForm = z.infer<typeof crearPedidoSchema>;

export const ACCIONES_PEDIDO = ["EN_CURSO", "RESUELTO", "RECHAZADO", "CANCELADO", "COMENTAR"] as const;
export type AccionPedido = (typeof ACCIONES_PEDIDO)[number];

/** Cambio de estado o comentario. Rechazar exige motivo (el backend también lo valida). */
export const accionPedidoSchema = z
  .object({
    accion: z.enum(ACCIONES_PEDIDO),
    comentario: z.string().trim().max(1000, M.tamano(0, 1000)),
  })
  .superRefine((v, ctx) => {
    if (v.accion === "RECHAZADO" && !v.comentario) {
      ctx.addIssue({ code: "custom", path: ["comentario"], message: "Para rechazar escribí el motivo" });
    }
    if (v.accion === "COMENTAR" && !v.comentario) {
      ctx.addIssue({ code: "custom", path: ["comentario"], message: M.vacio });
    }
  });
export type AccionPedidoForm = z.infer<typeof accionPedidoSchema>;
