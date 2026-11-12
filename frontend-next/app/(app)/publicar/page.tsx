import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaPublicar, type PestanaPublicar } from "@/features/publicar/PantallaPublicar";
import { cargar, usuarioActual } from "@/lib/api/servidor";
import { puedePublicar } from "@/lib/permisos";

export const metadata: Metadata = { title: "Publicar" };

const PESTANAS: readonly PestanaPublicar[] = ["aviso", "evento", "publicados"];

/** Requiere PUBLICAR_GENERAL o PUBLICAR_SECTOR. Sin permiso: a Inicio (el backend igual rechazaría con 403). */
export default async function PaginaPublicar({ searchParams }: PageProps<"/publicar">) {
  const usuario = await usuarioActual();
  if (!puedePublicar(usuario)) redirect("/inicio");
  const { tipo } = await searchParams;
  const sectores = await cargar((api) => api.directorio.sectores());
  if (!sectores.ok) return <ErrorPantalla titulo="Publicar" error={sectores.error} volver="/mas" />;
  const inicial = PESTANAS.find((p) => p === tipo) ?? "aviso";
  return <PantallaPublicar sectores={sectores.datos} pestanaInicial={inicial} />;
}
