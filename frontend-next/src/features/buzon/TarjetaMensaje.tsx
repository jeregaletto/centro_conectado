import type { ReactNode } from "react";

import { Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { ESTADO_MENSAJE, TIPO_MENSAJE, TONO_MENSAJE } from "@/lib/etiquetas";
import { fecha, fechaHora } from "@/lib/fechas";
import type { MensajeBuzon } from "@/lib/tipos";

/** Un mensaje del buzón. `gestion` muestra el texto completo y el autor (si no es anónimo). */
export function TarjetaMensaje({ m, gestion, children }: { m: MensajeBuzon; gestion?: boolean; children?: ReactNode }) {
  const abierto = m.estado === "RECIBIDO" || m.estado === "EN_REVISION";
  return (
    <Tarjeta como="li" acento={m.vencido && abierto ? "error" : "neutro"}>
      <Chip tono={TONO_MENSAJE[m.estado]}>{ESTADO_MENSAJE[m.estado]}</Chip>
      <Chip>{TIPO_MENSAJE[m.tipo]}</Chip>
      {m.anonimo && <Chip>Anónimo</Chip>}
      {gestion && m.vencido && abierto && <Chip tono="error">Fuera de plazo</Chip>}
      <TituloTarjeta>{m.asunto}</TituloTarjeta>
      {gestion && <p className="mt-1.5 whitespace-pre-line">{m.cuerpo}</p>}
      <Meta>
        {gestion
          ? `${m.anonimo ? "Anónimo" : [m.autor, m.sector].filter(Boolean).join(" · ")} · ${fechaHora(m.creadoEn)}`
          : `Enviado el ${fechaHora(m.creadoEn)}${m.anonimo ? ` · Código ${m.codigoSeguimiento}` : ""}`}
      </Meta>
      {m.respuesta ? (
        <div className="mt-2.5 rounded-[10px] bg-ok-fondo px-3 py-2.5">
          <strong>Respuesta</strong>
          {m.respondidoEn ? ` · ${fecha(m.respondidoEn)}` : ""}
          <p className="mt-1 whitespace-pre-line">{m.respuesta}</p>
        </div>
      ) : (
        abierto && (
          <Meta>
            {m.vencido
              ? "Fuera de plazo: ya se avisó a Dirección"
              : `${gestion ? "Responder" : "Respuesta"} antes del ${fechaHora(m.plazoRespuesta)}`}
          </Meta>
        )
      )}
      {children}
    </Tarjeta>
  );
}
