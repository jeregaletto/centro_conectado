"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import { ProveedorAvisos } from "@/components/ui/Toast";
import { COLOR_ROL } from "@/lib/permisos";
import type { UsuarioActual } from "@/lib/tipos";
import { crearStoreSesion, StoreSesionContext } from "@/stores/usuario";

/**
 * Hidrata el store de Zustand con el usuario que leyó el servidor y pinta el marco con el color del rol
 * y la vista (COMPLETA / SIMPLE).
 */
export function ProveedorSesion({ usuario, children }: { usuario: UsuarioActual; children: ReactNode }) {
  const [store] = useState(() => crearStoreSesion(usuario));
  const estilo = { "--color-rol": COLOR_ROL[usuario.rol] } as CSSProperties;
  return (
    <StoreSesionContext value={store}>
      <ProveedorAvisos>
        <div data-vista={usuario.vista} data-rol={usuario.rol} style={estilo} className="min-h-dvh pb-28 simple:pb-32">
          {children}
        </div>
      </ProveedorAvisos>
    </StoreSesionContext>
  );
}
