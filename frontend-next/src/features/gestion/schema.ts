import { z } from "zod";

import { M } from "@/features/comun/mensajes";

/** GuardarTareaRequest */
export const tareaSchema = z.object({
  sectorId: z.number({ error: M.nulo }).int().positive(M.nulo),
  puesto: z.string().trim().max(80, M.tamano(0, 80)).nullable(),
  titulo: z.string().trim().min(1, M.vacio).max(120, M.tamano(0, 120)),
  descripcion: z.string().trim().max(500, M.tamano(0, 500)).nullable(),
  icono: z.string().trim().min(1, M.vacio).max(40, M.tamano(0, 40)),
  frecuencia: z.enum(["DIARIA", "SEMANAL"], { error: M.nulo }),
  orden: z.number().int().min(0, M.minimo(0)),
});

const ROLES = ["DIRECCION", "COMUNICACION", "REFERENTE", "PROFESIONAL", "ADMINISTRATIVO", "MAESTRANZA"] as const;
const opcional = (max: number) => z.string().trim().max(max, M.tamano(0, max)).nullable();

/** CrearUsuarioRequest */
export const crearUsuarioSchema = z.object({
  usuario: z.string().trim().min(1, M.vacio).max(40, M.tamano(0, 40)),
  nombre: z.string().trim().min(1, M.vacio).max(80, M.tamano(0, 80)),
  apellido: z.string().trim().min(1, M.vacio).max(80, M.tamano(0, 80)),
  email: z.email(M.email).max(150, M.tamano(0, 150)).nullable(),
  telefono: opcional(40),
  interno: opcional(20),
  puesto: z.string().trim().min(1, M.vacio).max(80, M.tamano(0, 80)),
  rol: z.enum(ROLES, { error: M.nulo }),
  sectorId: z.number({ error: M.nulo }).int().positive(M.nulo),
  passwordInicial: z.string().min(8, M.tamano(8, 100)).max(100, M.tamano(8, 100)),
});

/** ResetPasswordRequest */
export const resetPasswordSchema = z.object({
  passwordTemporal: z.string().min(8, M.tamano(8, 100)).max(100, M.tamano(8, 100)),
});
