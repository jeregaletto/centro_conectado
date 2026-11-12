import { z } from "zod";

/** Mismos mensajes que LoginRequest del backend. */
export const loginSchema = z.object({
  usuario: z.string().trim().min(1, "Ingresá tu DNI o usuario").max(40, "el tamaño debe estar entre 0 y 40"),
  password: z.string().min(1, "Ingresá tu contraseña").max(100, "el tamaño debe estar entre 0 y 100"),
  recordar: z.boolean().default(false),
});
export type LoginForm = z.infer<typeof loginSchema>;

/** Mismos mensajes que CambiarPasswordRequest del backend. */
export const cambiarPasswordSchema = z.object({
  actual: z.string().min(1, "no debe estar vacío"),
  nueva: z
    .string()
    .min(8, "La nueva contraseña debe tener entre 8 y 100 caracteres")
    .max(100, "La nueva contraseña debe tener entre 8 y 100 caracteres"),
});
export type CambiarPasswordForm = z.infer<typeof cambiarPasswordSchema>;
