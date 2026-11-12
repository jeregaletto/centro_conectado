import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PantallaGestion } from "@/features/gestion/PantallaGestion";
import { cargar, usuarioActual } from "@/lib/api/servidor";
import { seccionesGestion, type SeccionGestion } from "@/lib/permisos";

export const metadata: Metadata = { title: "Gestión" };

/** Las pestañas dependen de los permisos. Sin ninguno: a Inicio (el backend igual devolvería 403). */
export default async function PaginaGestion({ searchParams }: PageProps<"/gestion">) {
  const usuario = await usuarioActual();
  const secciones = seccionesGestion(usuario);
  if (secciones.length === 0) redirect("/inicio");
  const { seccion } = await searchParams;
  const sectores = await cargar((api) => api.directorio.sectores());
  const inicial: SeccionGestion = secciones.find((s) => s === seccion) ?? secciones[0];
  return <PantallaGestion secciones={secciones} inicial={inicial} sectores={sectores.ok ? sectores.datos : []} />;
}
