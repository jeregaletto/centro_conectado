import type { Metadata } from "next";

import { PantallaBuzon } from "@/features/buzon/PantallaBuzon";
import { cargar } from "@/lib/api/servidor";

export const metadata: Metadata = { title: "Buzón" };

/**
 * "Mis mensajes" se arma en el cliente: los anónimos se buscan con los códigos guardados en este dispositivo
 * (localStorage), que el servidor no conoce. Si se entra con ?codigo= (notificación de respuesta),
 * ese seguimiento se busca acá.
 */
export default async function PaginaBuzon({ searchParams }: PageProps<"/buzon">) {
  const { codigo } = await searchParams;
  const valido = typeof codigo === "string" && /^[A-Za-z0-9]{4,20}$/.test(codigo) ? codigo.toUpperCase() : null;
  const seguimiento = valido ? await cargar((api) => api.buzon.seguimiento(valido)) : null;
  return (
    <PantallaBuzon
      codigoInicial={valido}
      seguimientoInicial={seguimiento?.ok ? seguimiento.datos : null}
      errorSeguimiento={seguimiento && !seguimiento.ok ? seguimiento.error : null}
    />
  );
}
