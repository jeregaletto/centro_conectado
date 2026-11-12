"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Icono } from "@/components/ui/Icono";
import { Mensaje } from "@/components/ui/Mensaje";
import { Seccion } from "@/components/ui/Varios";
import { cerrarSesion } from "@/features/login/sesion";
import { mensajeAmigable } from "@/lib/api/errores";
import type { NombreIcono } from "@/lib/iconos";
import { menuMas, PANTALLAS } from "@/lib/permisos";
import { useUsuario } from "@/stores/usuario";

const CLASE_BALDOSA =
  "flex min-h-24 w-full flex-col items-start gap-1.5 rounded-cc bg-papel p-3.5 text-left font-bold text-tinta no-underline cursor-pointer simple:min-h-28";

function Baldosa({ icono, titulo, ayuda }: { icono: NombreIcono; titulo: string; ayuda?: string }): ReactNode {
  return (
    <>
      <Icono nombre={icono} className="size-7" />
      {titulo}
      {ayuda && <span className="text-[15px] font-normal text-tinta-suave">{ayuda}</span>}
    </>
  );
}

export function PantallaMas() {
  const usuario = useUsuario();
  const [error, setError] = useState<string | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    try {
      await cerrarSesion();
      // Recarga completa a propósito: descarta el estado y la caché del router de la sesión que se cerró.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    } catch (e) {
      setError(mensajeAmigable(e));
      setSaliendo(false);
    }
  }

  return (
    <>
      <Encabezado
        titulo={`${usuario.nombre} ${usuario.apellido}`}
        subtitulo={[usuario.rolEtiqueta, usuario.puesto, usuario.sector.nombre].filter(Boolean).join(" · ")}
      />
      <Contenido>
        <nav aria-label="Más secciones" className="grid grid-cols-2 gap-2.5">
          {menuMas(usuario).map((clave) => {
            const p = PANTALLAS[clave];
            return (
              <Link key={clave} href={p.href} className={CLASE_BALDOSA}>
                <Baldosa icono={p.icono} titulo={p.etiqueta} ayuda={p.ayuda} />
              </Link>
            );
          })}
        </nav>

        <Seccion titulo="Mi cuenta" id="t-cuenta">
          <Mensaje tipo="error">{error}</Mensaje>
          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/notificaciones" className={CLASE_BALDOSA}>
              <Baldosa icono="campana" titulo="Notificaciones" />
            </Link>
            <Link href="/login?cambiar=1" className={CLASE_BALDOSA}>
              <Baldosa icono="llave" titulo="Cambiar contraseña" />
            </Link>
            <button type="button" onClick={salir} disabled={saliendo} aria-busy={saliendo || undefined} className={CLASE_BALDOSA}>
              <Baldosa icono="salir" titulo={saliendo ? "Cerrando sesión…" : "Cerrar sesión"} />
            </button>
          </div>
        </Seccion>
      </Contenido>
    </>
  );
}
