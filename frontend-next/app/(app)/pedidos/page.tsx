import type { Metadata } from "next";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaPedidos } from "@/features/pedidos/PantallaPedidos";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Pedidos" };

export default async function PaginaPedidos() {
  const [recibidos, sectores] = await Promise.all([
    cargar((api) => api.pedidos.recibidos()),
    cargar((api) => api.directorio.sectores()),
  ]);
  if (!recibidos.ok) return <ErrorPantalla titulo="Pedidos entre áreas" error={recibidos.error} />;
  return <PantallaPedidos recibidosIniciales={recibidos.datos} sectores={sectores.ok ? sectores.datos : []} />;
}
