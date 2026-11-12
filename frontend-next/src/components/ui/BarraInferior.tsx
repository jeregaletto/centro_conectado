"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icono } from "@/components/ui/Icono";
import { menuPara, PANTALLAS, pestanaActiva } from "@/lib/permisos";
import { useUsuario } from "@/stores/usuario";

/** Barra de abajo según el rol: 4 botones grandes en vista simple, 5 en la completa. */
export function BarraInferior() {
  const usuario = useUsuario();
  const pathname = usePathname();
  const activa = pestanaActiva(pathname, usuario);
  const claves = menuPara(usuario);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 grid border-t-2 border-pared-2 bg-papel pb-[env(safe-area-inset-bottom)]"
      style={{ gridTemplateColumns: `repeat(${claves.length}, minmax(0, 1fr))` }}
    >
      {claves.map((clave) => {
        const p = PANTALLAS[clave];
        const esActiva = clave === activa;
        return (
          <Link
            key={clave}
            href={p.href}
            aria-current={esActiva ? "page" : undefined}
            className={
              "flex min-h-16 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-center text-[13px] text-tinta-suave no-underline " +
              "simple:min-h-[76px] simple:text-base simple:font-bold " +
              (esActiva ? "font-bold text-tinta shadow-[inset_0_4px_0_var(--color-rol)]" : "")
            }
          >
            <Icono nombre={p.icono} className="size-6 simple:size-8" />
            <span>{p.etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}
