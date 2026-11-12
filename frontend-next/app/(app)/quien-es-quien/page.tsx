import type { Metadata } from "next";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaQuien } from "@/features/quien-es-quien/PantallaQuien";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Quién es quién" };

export default async function PaginaQuien() {
  const [personas, sectores, acudir] = await Promise.all([
    cargar((api) => api.directorio.buscar()),
    cargar((api) => api.directorio.sectores()),
    cargar((api) => api.directorio.aQuienAcudir()),
  ]);
  if (!personas.ok) return <ErrorPantalla titulo="Quién es quién" error={personas.error} volver="/mas" />;
  return (
    <PantallaQuien
      personasIniciales={personas.datos}
      sectores={sectores.ok ? sectores.datos : []}
      aQuienAcudir={acudir.ok ? acudir.datos : []}
      errorSecundario={!sectores.ok ? sectores.error : !acudir.ok ? acudir.error : null}
    />
  );
}
