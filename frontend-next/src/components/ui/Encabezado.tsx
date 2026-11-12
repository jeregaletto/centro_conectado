"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import { Icono } from "@/components/ui/Icono";
import { api } from "@/lib/api";
import { useSesion } from "@/stores/usuario";

const CADA_MS = 60_000;

/** Campanita: GET /api/notificaciones/contador al entrar y cada 60 s. */
export function Campana() {
  const noLeidas = useSesion((s) => s.noLeidas);
  const setNoLeidas = useSesion((s) => s.setNoLeidas);

  useEffect(() => {
    let vivo = true;
    const actualizar = async () => {
      try {
        const { noLeidas: n } = await api.notificaciones.contador();
        if (vivo) setNoLeidas(n);
      } catch {
        // Sin conexión: la campanita queda como estaba, no rompemos la pantalla.
      }
    };
    void actualizar();
    const id = setInterval(actualizar, CADA_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [setNoLeidas]);

  const n = noLeidas ?? 0;
  const etiqueta = n === 0 ? "Notificaciones, ninguna sin leer" : `Notificaciones, ${n} sin leer`;
  return (
    <Link
      href="/notificaciones"
      aria-label={etiqueta}
      className="relative inline-grid size-12 place-items-center rounded-full bg-white/15 text-texto-rol"
    >
      <Icono nombre="campana" />
      <span
        data-testid="contador-notificaciones"
        data-valor={n}
        hidden={n === 0}
        className="absolute -top-0.5 -right-1 min-w-6 rounded-full bg-senal px-1.5 text-center text-sm leading-6 font-bold text-tinta"
      >
        {n > 99 ? "99+" : n}
      </span>
    </Link>
  );
}

interface PropsEncabezado {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  antetitulo?: ReactNode;
  /** Ruta del botón volver (pantallas de segundo nivel). */
  volver?: string;
  campana?: boolean;
}

export function Encabezado({ titulo, subtitulo, antetitulo, volver, campana = true }: PropsEncabezado) {
  return (
    <header className="border-b-[6px] border-senal bg-rol px-4 pt-4 pb-5 text-texto-rol">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {volver && (
          <Link
            href={volver}
            aria-label="Volver"
            className="inline-grid size-11 shrink-0 place-items-center rounded-full bg-white/15 text-texto-rol"
          >
            <Icono nombre="volver" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {antetitulo && <p className="text-[15px] opacity-90">{antetitulo}</p>}
          <h1 className="text-[26px] leading-tight font-bold tracking-tight break-words simple:text-[30px]">{titulo}</h1>
          {subtitulo && <p className="mt-0.5 text-[15px] opacity-90">{subtitulo}</p>}
        </div>
        {campana && <Campana />}
      </div>
    </header>
  );
}

export function Contenido({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-3xl p-4">{children}</main>;
}
