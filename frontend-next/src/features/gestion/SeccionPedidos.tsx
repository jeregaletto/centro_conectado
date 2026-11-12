"use client";

import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { Seccion } from "@/components/ui/Varios";
import { useConsulta } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { ESTADO_PEDIDO } from "@/lib/etiquetas";
import type { EstadoPedido } from "@/lib/tipos";

/** Tablero de Dirección: cuántos pedidos hay en cada estado y cuáles están vencidos. */
export function SeccionPedidos() {
  const { datos, error } = useConsulta("tablero", () => api.pedidos.todos());
  if (error) return <Mensaje tipo="error">{error}</Mensaje>;
  if (!datos) return <Cargando />;

  const cuenta = new Map<EstadoPedido, number>();
  for (const p of datos) cuenta.set(p.estado, (cuenta.get(p.estado) ?? 0) + 1);
  const vencidos = datos.filter((p) => p.vencido);

  return (
    <>
      <dl className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
        {(Object.keys(ESTADO_PEDIDO) as EstadoPedido[]).map((k) => (
          <div key={k} className="rounded-cc bg-papel p-3">
            <dd className="text-[28px] leading-tight font-bold">{cuenta.get(k) ?? 0}</dd>
            <dt>{ESTADO_PEDIDO[k]}</dt>
          </div>
        ))}
        <div className="rounded-cc bg-papel p-3 text-error">
          <dd className="text-[28px] leading-tight font-bold">{vencidos.length}</dd>
          <dt>Vencidos</dt>
        </div>
      </dl>
      <Seccion titulo="Vencidos" id="t-vencidos">
        {vencidos.length === 0 ? (
          <Vacio>No hay pedidos vencidos.</Vacio>
        ) : (
          <ul>
            {vencidos.map((p) => (
              <li key={p.id}>
                <Tarjeta href={`/pedidos/${p.id}`} acento="error">
                  <TituloTarjeta>{p.asunto}</TituloTarjeta>
                  <Meta>
                    {p.codigo} · {p.sectorOrigen.nombre} → {p.sectorDestino.nombre}
                  </Meta>
                  <Meta className="font-bold text-error">Vencido hace {Math.abs(p.horasRestantes ?? 0)} h</Meta>
                </Tarjeta>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </>
  );
}
