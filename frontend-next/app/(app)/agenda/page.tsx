import type { Metadata } from "next";
import { connection } from "next/server";

import { ErrorPantalla } from "@/components/ErrorPantalla";
import { PantallaAgenda } from "@/features/agenda/PantallaAgenda";
import { cargar } from "@/lib/api/servidor";
import { diaDe, hoy, sumarDias } from "@/lib/fechas";

export const metadata: Metadata = { title: "Agenda" };

export default async function PaginaAgenda({ searchParams }: PageProps<"/agenda">) {
  const { evento } = await searchParams;
  const resaltado = typeof evento === "string" && /^\d+$/.test(evento) ? Number(evento) : null;

  // "Hoy" depende del momento del pedido: no se puede prerenderizar.
  await connection();
  const diaDeHoy = hoy();
  // Si llegó desde una notificación, arranca en la semana del evento.
  let desde = diaDeHoy;
  if (resaltado) {
    const ev = await cargar((api) => api.agenda.obtener(resaltado));
    if (ev.ok) desde = diaDe(ev.datos.inicio);
  }
  const r = await cargar((api) => api.agenda.listar(desde, sumarDias(desde, 6)));
  if (!r.ok) return <ErrorPantalla titulo="Agenda" error={r.error} />;
  return <PantallaAgenda hoy={diaDeHoy} desdeInicial={desde} eventosIniciales={r.datos} eventoResaltado={resaltado} />;
}
