import type { Metadata } from "next";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaInicio } from "@/features/inicio/PantallaInicio";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Inicio" };

export default async function PaginaInicio({ searchParams }: PageProps<"/inicio">) {
  const { aviso } = await searchParams;
  const r = await cargar((api) => api.inicio.obtener());
  if (!r.ok) return <ErrorPantalla titulo="Inicio" error={r.error} />;
  const resaltado = typeof aviso === "string" && /^\d+$/.test(aviso) ? Number(aviso) : null;
  return <PantallaInicio inicio={r.datos} avisoResaltado={resaltado} />;
}
