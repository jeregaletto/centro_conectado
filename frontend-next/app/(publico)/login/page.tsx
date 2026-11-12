import type { Metadata } from "next";
import { Suspense } from "react";

import { Cargando } from "@/components/ui/Mensaje";
import { PantallaLogin } from "@/features/login/PantallaLogin";
import { rutaSegura } from "@/lib/rutas";

export const metadata: Metadata = { title: "Ingresar" };

/** Modo demo: muestra las "líneas de piso" para entrar con un rol de prueba. Apagado en producción. */
function modoDemo(): boolean {
  const v = process.env.MODO_DEMO;
  if (v === "true") return true;
  if (v === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export default function PaginaLogin({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const p = await searchParams;
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <PantallaLogin
      volver={rutaSegura(uno(p.volver))}
      vencida={uno(p.vencida) === "1"}
      cambiar={uno(p.cambiar) === "1"}
      modoDemo={modoDemo()}
    />
  );
}
