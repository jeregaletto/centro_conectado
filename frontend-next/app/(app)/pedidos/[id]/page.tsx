import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaPedido } from "@/features/pedidos/PantallaPedido";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Pedido" };

export default async function PaginaPedido({ params }: PageProps<"/pedidos/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const r = await cargar((api) => api.pedidos.detalle(Number(id)));
  if (!r.ok) return <ErrorPantalla titulo="Pedido" error={r.error} volver="/pedidos" />;
  return <PantallaPedido inicial={r.datos} />;
}
