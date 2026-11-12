import type { Metadata } from "next";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaNotificaciones } from "@/features/notificaciones/PantallaNotificaciones";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function PaginaNotificaciones() {
  const r = await cargar((api) => api.notificaciones.listar(false));
  if (!r.ok) return <ErrorPantalla titulo="Notificaciones" error={r.error} volver="/inicio" />;
  return <PantallaNotificaciones iniciales={r.datos} />;
}
