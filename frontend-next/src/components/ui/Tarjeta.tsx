import Link from "next/link";
import type { ReactNode } from "react";

export type AcentoTarjeta = "neutro" | "senal" | "error" | "alerta" | "ok" | "apagado";

const ACENTOS: Record<AcentoTarjeta, string> = {
  neutro: "border-l-pared-2",
  senal: "border-l-senal",
  error: "border-l-error",
  alerta: "border-l-[#b25e00]",
  ok: "border-l-ok",
  apagado: "border-l-borde opacity-85",
};

const BASE = "mb-2.5 block rounded-cc border-l-[6px] bg-papel px-4 py-3.5 text-tinta no-underline";

interface PropsTarjeta {
  acento?: AcentoTarjeta;
  href?: string;
  como?: "article" | "li" | "div";
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Tarjeta({ acento = "neutro", href, como = "article", id, className = "", children }: PropsTarjeta) {
  const clases = `${BASE} ${ACENTOS[acento]} ${className}`;
  if (href) {
    return (
      <Link href={href} id={id} className={`${clases} hover:shadow-[0_2px_0_var(--borde)]`}>
        {children}
      </Link>
    );
  }
  const Etiqueta = como;
  return (
    <Etiqueta id={id} className={clases}>
      {children}
    </Etiqueta>
  );
}

export function TituloTarjeta({ children }: { children: ReactNode }) {
  return <h3 className="mb-1 text-lg leading-snug font-bold simple:text-xl">{children}</h3>;
}

export function Meta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`mt-1 text-[15px] text-tinta-suave ${className}`}>{children}</p>;
}

export function Acciones({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

export type TonoChip = "neutro" | "error" | "alerta" | "ok" | "info" | "apagado";

const TONOS: Record<TonoChip, string> = {
  neutro: "bg-pared text-tinta",
  error: "bg-error-fondo text-error",
  alerta: "bg-alerta-fondo text-alerta",
  ok: "bg-ok-fondo text-ok",
  info: "bg-info-fondo text-info",
  apagado: "bg-pared-2 text-tinta-suave",
};

export function Chip({ tono = "neutro", children }: { tono?: TonoChip; children: ReactNode }) {
  return (
    <span className={`mr-1 mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${TONOS[tono]}`}>
      {children}
    </span>
  );
}
