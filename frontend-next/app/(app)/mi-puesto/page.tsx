import type { Metadata } from "next";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaMiPuesto } from "@/features/mi-puesto/PantallaMiPuesto";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Mi puesto" };

export default async function PaginaMiPuesto() {
  const r = await cargar((api) => api.puesto.miPuesto());
  if (!r.ok) return <ErrorPantalla titulo="Mi puesto" error={r.error} />;
  return <PantallaMiPuesto inicial={r.datos} />;
}
