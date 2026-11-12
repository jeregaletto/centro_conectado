"use client";

import type { ReactNode } from "react";

import { Icono } from "@/components/ui/Icono";
import { Acciones, Chip, Meta, Tarjeta, TituloTarjeta, type AcentoTarjeta } from "@/components/ui/Tarjeta";
import { TIPO_AVISO, TONO_AVISO } from "@/lib/etiquetas";
import { fecha } from "@/lib/fechas";
import type { Aviso, TipoAviso } from "@/lib/tipos";

const ACENTO: Record<TipoAviso, AcentoTarjeta> = { NOVEDAD: "senal", CAMBIO_HORARIO: "alerta", URGENTE: "error" };

interface Props {
  aviso: Aviso;
  resaltado?: boolean;
  /** Marca de vigencia (en Publicar). */
  mostrarVigencia?: boolean;
  acciones?: ReactNode;
  children?: ReactNode;
}

export function TarjetaAviso({ aviso: a, resaltado, mostrarVigencia, acciones, children }: Props) {
  return (
    <Tarjeta
      id={`aviso-${a.id}`}
      acento={a.leido && !resaltado ? "apagado" : ACENTO[a.tipo]}
      className={resaltado ? "ring-3 ring-senal" : ""}
    >
      <Chip tono={TONO_AVISO[a.tipo]}>{TIPO_AVISO[a.tipo]}</Chip>
      {a.fijado && (
        <Chip>
          <Icono nombre="fijado" className="size-4" /> Fijado
        </Chip>
      )}
      {mostrarVigencia && a.porVencer && <Chip tono="alerta">Vence pronto</Chip>}
      <TituloTarjeta>{a.titulo}</TituloTarjeta>
      <p className="mt-1.5 whitespace-pre-line">{a.cuerpo}</p>
      <Meta>
        {a.autor} · {fecha(a.publicadoEn)}
        {a.sectores.length > 0 ? ` · Para ${a.sectores.join(", ")}` : " · Para todo el Centro"}
        {mostrarVigencia ? ` · Vence ${fecha(a.vigenteHasta)}` : ""}
      </Meta>
      {children}
      {acciones && <Acciones>{acciones}</Acciones>}
    </Tarjeta>
  );
}
