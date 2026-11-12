import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { ProveedorSesion } from "@/components/ProveedorSesion";
import { BarraInferior } from "@/components/ui/BarraInferior";
import { Cargando } from "@/components/ui/Mensaje";
import { usuarioActual } from "@/lib/api/servidor";

/**
 * Marco de las pantallas protegidas. La sesión se lee en el servidor (cookie → GET /api/auth/me),
 * dentro de un <Suspense> como pide Cache Components. El token no llega al navegador:
 * al cliente solo le pasamos el usuario.
 */
export default function LayoutApp({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Cargando texto="Entrando…" />}>
      <Marco>{children}</Marco>
    </Suspense>
  );
}

async function Marco({ children }: { children: ReactNode }) {
  const usuario = await usuarioActual();
  if (usuario.debeCambiarPassword) redirect("/login?cambiar=1");
  return (
    <ProveedorSesion usuario={usuario}>
      {children}
      <BarraInferior />
    </ProveedorSesion>
  );
}
