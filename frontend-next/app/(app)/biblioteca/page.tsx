import type { Metadata } from "next";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaBiblioteca } from "@/features/biblioteca/PantallaBiblioteca";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Biblioteca" };

export default async function PaginaBiblioteca({ searchParams }: PageProps<"/biblioteca">) {
  const { id } = await searchParams;
  const [docs, sectores] = await Promise.all([
    cargar((api) => api.biblioteca.listar()),
    cargar((api) => api.directorio.sectores()),
  ]);
  if (!docs.ok) return <ErrorPantalla titulo="Biblioteca" error={docs.error} volver="/mas" />;
  return (
    <PantallaBiblioteca
      documentosIniciales={docs.datos}
      sectores={sectores.ok ? sectores.datos : []}
      resaltado={typeof id === "string" && /^\d+$/.test(id) ? Number(id) : null}
    />
  );
}
