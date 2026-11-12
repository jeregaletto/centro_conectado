"use client";

import { useState } from "react";

import { DatosContacto } from "@/components/Contacto";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Icono } from "@/components/ui/Icono";
import { Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Chip, Tarjeta } from "@/components/ui/Tarjeta";
import { BarraAvance, Seccion } from "@/components/ui/Varios";
import { useAccion } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { fechaLarga, hora } from "@/lib/fechas";
import { esNombreIcono } from "@/lib/iconos";
import type { MiPuesto, TareaDelDia } from "@/lib/tipos";

function textoAvance(mp: MiPuesto): string {
  const a = mp.avance;
  if (a.total === 0) return "No tenés tareas asignadas";
  return a.hechas === a.total ? `¡Listo! Hiciste las ${a.total} tareas` : `Hiciste ${a.hechas} de ${a.total}`;
}

export function PantallaMiPuesto({ inicial }: { inicial: MiPuesto }) {
  const [mp, setMp] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const { ocupadoEn, correr } = useAccion();

  async function alternar(t: TareaDelDia) {
    if (ocupadoEn) return;
    setError(null);
    // Tildar = POST, destildar = DELETE. Las dos devuelven la pantalla completa: repintamos con eso.
    const r = await correr(`t-${t.id}`, () => (t.completada ? api.puesto.desmarcar(t.id) : api.puesto.completar(t.id)));
    if (r.ok) setMp(r.valor);
    else setError(r.error);
  }

  return (
    <>
      <Encabezado
        titulo="Mi puesto"
        subtitulo={[mp.puesto, mp.sector, fechaLarga(mp.fecha)].filter(Boolean).join(" · ")}
      />
      <Contenido>
        <section aria-live="polite" className="mb-3.5 rounded-cc bg-papel p-4">
          <p className="mb-2 text-xl font-bold" data-testid="avance-texto">
            {textoAvance(mp)}
          </p>
          <BarraAvance avance={mp.avance} etiqueta="Avance de tus tareas" />
        </section>
        <Mensaje tipo="error">{error}</Mensaje>

        <Seccion titulo="Tareas de hoy" id="t-tareas">
          {mp.tareas.length === 0 ? (
            <Vacio>Tu sector todavía no cargó tareas para tu puesto. Consultá a tu referente.</Vacio>
          ) : (
            <ul>
              {mp.tareas.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-pressed={t.completada}
                    aria-busy={ocupadoEn === `t-${t.id}` || undefined}
                    disabled={ocupadoEn !== null}
                    onClick={() => alternar(t)}
                    className={
                      "mb-2.5 grid min-h-[72px] w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-cc border-[3px] px-4 py-3 text-left simple:min-h-[92px] disabled:cursor-wait " +
                      (t.completada ? "border-ok bg-ok-fondo" : "border-pared-2 bg-papel")
                    }
                  >
                    <Icono nombre={esNombreIcono(t.icono) ? t.icono : "check"} className="size-9 simple:size-11" />
                    <span>
                      <span className={`block font-bold ${t.completada ? "line-through" : ""}`}>{t.titulo}</span>
                      {t.descripcion && <span className="block text-[15px] text-tinta-suave">{t.descripcion}</span>}
                      {t.frecuencia === "SEMANAL" && <Chip>Esta semana</Chip>}
                      {t.completada && t.completadaEn && (
                        <span className="block text-[15px] text-tinta-suave">Hecha a las {hora(t.completadaEn)}</span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-10 place-items-center rounded-full border-[3px] ${t.completada ? "border-ok bg-ok text-papel" : "border-borde"}`}
                    >
                      {t.completada && (
                        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m6 12 4 4 8-8" />
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        {mp.referente && (
          <Seccion titulo="¿Dudas? Tu referente" id="t-referente">
            <Tarjeta>
              <DatosContacto contacto={mp.referente} whatsapp={false} />
            </Tarjeta>
          </Seccion>
        )}

        {mp.protocolos.length > 0 && (
          <Seccion titulo="Protocolos de tu sector" id="t-protocolos">
            {mp.protocolos.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2.5 flex items-center gap-2 rounded-cc border-l-[6px] border-l-pared-2 bg-papel px-4 py-3.5 font-bold text-tinta no-underline"
              >
                <Icono nombre="documento" /> {p.titulo}
              </a>
            ))}
          </Seccion>
        )}
      </Contenido>
    </>
  );
}
