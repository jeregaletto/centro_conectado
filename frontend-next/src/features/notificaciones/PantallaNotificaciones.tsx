"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Opcion } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Meta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { useAccion, useConsulta } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { fechaHora } from "@/lib/fechas";
import { rutaDeLink } from "@/lib/notificaciones";
import type { Notificacion } from "@/lib/tipos";
import { useSesion } from "@/stores/usuario";

export function PantallaNotificaciones({ iniciales }: { iniciales: Notificacion[] }) {
  const router = useRouter();
  const avisar = useAvisos();
  const descontar = useSesion((s) => s.descontar);
  const setNoLeidas = useSesion((s) => s.setNoLeidas);
  const { ocupadoEn, correr } = useAccion();
  const [soloNuevas, setSoloNuevas] = useState(false);
  const { datos, error, cargando, setDatos } = useConsulta(String(soloNuevas), () => api.notificaciones.listar(soloNuevas), iniciales);

  /** Tocar: marca como leída y navega al link (traducido a las rutas nuevas). */
  async function abrir(n: Notificacion) {
    if (!n.leida) {
      const r = await correr(`n-${n.id}`, () => api.notificaciones.marcarLeida(n.id));
      if (r.ok) {
        descontar();
        if (datos) setDatos(datos.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
      }
    }
    const ruta = rutaDeLink(n.link);
    if (ruta) router.push(ruta);
  }

  async function leerTodas() {
    const r = await correr("todas", () => api.notificaciones.leerTodas());
    if (!r.ok) {
      avisar(r.error, "error");
      return;
    }
    setNoLeidas(0);
    if (datos) setDatos(soloNuevas ? [] : datos.map((x) => ({ ...x, leida: true })));
    avisar("Listo, no te queda nada sin leer");
  }

  return (
    <>
      <Encabezado titulo="Notificaciones" volver="/inicio" campana={false} />
      <Contenido>
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === "todas"} onClick={leerTodas}>
            Marcar todas como leídas
          </Boton>
          <Opcion>
            <input type="checkbox" checked={soloNuevas} onChange={(e) => setSoloNuevas(e.target.checked)} /> Solo sin leer
          </Opcion>
        </div>
        <Mensaje tipo="error">{error}</Mensaje>
        <div aria-live="polite" aria-busy={cargando}>
          {cargando ? (
            <Cargando />
          ) : !datos || datos.length === 0 ? (
            !error && <Vacio>No tenés notificaciones.</Vacio>
          ) : (
            <ul>
              {datos.map((n) => {
                const ruta = rutaDeLink(n.link);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => abrir(n)}
                      aria-busy={ocupadoEn === `n-${n.id}` || undefined}
                      className={
                        "mb-2.5 block w-full cursor-pointer rounded-cc border-l-[6px] bg-papel px-4 py-3.5 text-left " +
                        (n.leida ? "border-l-borde" : "border-l-senal")
                      }
                    >
                      <span className="block text-lg leading-snug font-bold">
                        {!n.leida && <span className="sr-only">Sin leer: </span>}
                        {!n.leida && (
                          <span aria-hidden="true" className="mr-1.5 inline-block size-2.5 rounded-full bg-[#b25e00] align-middle" />
                        )}
                        {n.titulo}
                      </span>
                      {n.mensaje && <span className="mt-1 block whitespace-pre-line">{n.mensaje}</span>}
                      <Meta>
                        {fechaHora(n.creadaEn)}
                        {ruta ? " · Tocá para ver" : ""}
                      </Meta>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Contenido>
    </>
  );
}
