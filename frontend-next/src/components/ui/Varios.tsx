"use client";

import { useId, type ReactNode } from "react";

import type { Avance } from "@/lib/tipos";

export function Seccion({ titulo, children, id }: { titulo: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="mb-2">
      <h2 id={id} className="mt-6 mb-2.5 text-[19px] font-bold first:mt-1 simple:text-[22px]">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

interface PropsPestanas<T extends string> {
  etiqueta: string;
  opciones: readonly { valor: T; texto: string }[];
  activa: T;
  alCambiar: (valor: T) => void;
  /** id del panel que controlan las pestañas. */
  panel?: string;
}

/** Pestañas accesibles (tablist). Flechas izquierda/derecha para moverse. */
export function Pestanas<T extends string>({ etiqueta, opciones, activa, alCambiar, panel }: PropsPestanas<T>) {
  const base = useId();
  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      className="mb-3.5 flex gap-1.5 overflow-x-auto rounded-cc bg-pared-2 p-1"
      onKeyDown={(e) => {
        const i = opciones.findIndex((o) => o.valor === activa);
        if (e.key === "ArrowRight") alCambiar(opciones[(i + 1) % opciones.length].valor);
        if (e.key === "ArrowLeft") alCambiar(opciones[(i - 1 + opciones.length) % opciones.length].valor);
      }}
    >
      {opciones.map((o) => (
        <button
          key={o.valor}
          id={`${base}-${o.valor}`}
          type="button"
          role="tab"
          aria-selected={o.valor === activa}
          aria-controls={panel}
          tabIndex={o.valor === activa ? 0 : -1}
          onClick={() => alCambiar(o.valor)}
          className={
            "min-h-11 flex-1 cursor-pointer rounded-[9px] px-3 font-bold whitespace-nowrap text-tinta-suave simple:min-h-14 " +
            "aria-selected:bg-papel aria-selected:text-tinta aria-selected:shadow-[0_1px_0_var(--borde)]"
          }
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

export function BarraAvance({ avance, etiqueta }: { avance: Avance; etiqueta: string }) {
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={avance.porcentaje}
      className="h-4 overflow-hidden rounded-full bg-pared-2"
    >
      <div className="h-full rounded-full bg-ok transition-[width] duration-300" style={{ width: `${avance.porcentaje}%` }} />
    </div>
  );
}

export function Plegable({
  titulo,
  abierto,
  alCambiar,
  children,
}: {
  titulo: ReactNode;
  abierto?: boolean;
  alCambiar?: (abierto: boolean) => void;
  children: ReactNode;
}) {
  return (
    <details
      open={abierto}
      onToggle={(e) => alCambiar?.(e.currentTarget.open)}
      className="group mb-4 rounded-cc bg-papel"
    >
      <summary className="flex min-h-toque cursor-pointer list-none items-center justify-between px-4 py-3.5 font-bold [&::-webkit-details-marker]:hidden">
        {titulo}
        <span aria-hidden="true" className="text-2xl group-open:hidden">
          +
        </span>
        <span aria-hidden="true" className="hidden text-2xl group-open:inline">
          –
        </span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export function Formulario({
  children,
  alEnviar,
  etiqueta,
  className = "",
}: {
  children: ReactNode;
  alEnviar: (datos: FormData, form: HTMLFormElement) => void;
  etiqueta?: string;
  className?: string;
}) {
  return (
    <form
      noValidate
      aria-label={etiqueta}
      className={`mb-4 rounded-cc bg-papel p-4 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        alEnviar(new FormData(e.currentTarget), e.currentTarget);
      }}
    >
      {children}
    </form>
  );
}
