"use client";

import { useEffect, useState } from "react";

import { Boton, EnlaceBoton } from "@/components/ui/Boton";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Icono } from "@/components/ui/Icono";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Acciones, Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { useAccion, useConsulta } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { TIPO_EVENTO } from "@/lib/etiquetas";
import { diaDe, fecha, fechaHora, fechaLarga, hora, hoy, sumarDias } from "@/lib/fechas";
import { puedePublicar } from "@/lib/permisos";
import type { Evento, Fecha } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";

/** Descarga el .ics por el proxy (con la cookie) y lo ofrece como archivo. */
async function descargarIcs(id: number) {
  const blob = await api.agenda.ics(id);
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `evento-${id}.ics` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface Props {
  /** Día de hoy en Buenos Aires, calculado por el servidor al momento del pedido. */
  hoy: Fecha;
  desdeInicial: Fecha;
  eventosIniciales: Evento[];
  eventoResaltado: number | null;
}

export function PantallaAgenda({ hoy: hoyDia, desdeInicial, eventosIniciales, eventoResaltado }: Props) {
  const usuario = useUsuario();
  const avisar = useAvisos();
  const { ocupadoEn, correr } = useAccion();
  const [desde, setDesde] = useState(desdeInicial);
  const hasta = sumarDias(desde, 6);
  const { datos: eventos, error, cargando } = useConsulta(desde, () => api.agenda.listar(desde, hasta), eventosIniciales);

  useEffect(() => {
    if (eventoResaltado) document.getElementById(`evento-${eventoResaltado}`)?.scrollIntoView({ block: "center" });
  }, [eventoResaltado]);

  async function agregar(id: number) {
    const r = await correr(`ics-${id}`, () => descargarIcs(id));
    avisar(r.ok ? "Abrí el archivo descargado para sumarlo a tu calendario" : r.error, r.ok ? "ok" : "error");
  }

  const porDia = new Map<Fecha, Evento[]>();
  for (const e of eventos ?? []) {
    const d = diaDe(e.inicio);
    porDia.set(d, [...(porDia.get(d) ?? []), e]);
  }

  return (
    <>
      <Encabezado titulo="Agenda" subtitulo={`Del ${fecha(desde)} al ${fecha(hasta)}`} />
      <Contenido>
        <div className="mb-3.5 flex flex-wrap gap-2">
          <Boton variante="secundario" tamano="chico" onClick={() => setDesde(sumarDias(desde, -7))}>
            Semana anterior
          </Boton>
          <Boton variante="secundario" tamano="chico" onClick={() => setDesde(hoy())}>
            Hoy
          </Boton>
          <Boton variante="secundario" tamano="chico" onClick={() => setDesde(sumarDias(desde, 7))}>
            Semana siguiente
          </Boton>
          {puedePublicar(usuario) && (
            <EnlaceBoton href="/publicar?tipo=evento" tamano="chico">
              Nuevo evento
            </EnlaceBoton>
          )}
        </div>

        <Mensaje tipo="error">{error}</Mensaje>
        <div aria-live="polite" aria-busy={cargando}>
          {cargando ? (
            <Cargando />
          ) : porDia.size === 0 ? (
            !error && <Vacio>No hay eventos esta semana. Probá con la semana siguiente.</Vacio>
          ) : (
            [...porDia.keys()].sort().map((dia) => (
              <section key={dia} aria-label={fechaLarga(dia)}>
                <h2 className="mt-6 mb-2.5 text-[19px] font-bold first-letter:uppercase first:mt-1">
                  {dia === hoyDia ? `Hoy, ${fechaLarga(dia)}` : fechaLarga(dia)}
                </h2>
                {porDia.get(dia)?.map((e) => (
                  <Tarjeta
                    key={e.id}
                    id={`evento-${e.id}`}
                    acento={e.id === eventoResaltado ? "senal" : "neutro"}
                    className={e.id === eventoResaltado ? "ring-3 ring-senal" : ""}
                  >
                    <Chip>{TIPO_EVENTO[e.tipo]}</Chip>
                    <TituloTarjeta>
                      {hora(e.inicio)} a {diaDe(e.inicio) === diaDe(e.fin) ? hora(e.fin) : fechaHora(e.fin)} · {e.titulo}
                    </TituloTarjeta>
                    {e.lugar && (
                      <Meta className="flex items-center gap-1">
                        <Icono nombre="lugar" className="size-4" /> {e.lugar}
                      </Meta>
                    )}
                    {e.descripcion && <p className="mt-1.5 whitespace-pre-line">{e.descripcion}</p>}
                    <Meta>
                      {e.sectores.length ? `Para ${e.sectores.join(", ")}` : "Para todo el Centro"} · Publicó {e.autor}
                    </Meta>
                    <Acciones>
                      <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === `ics-${e.id}`} onClick={() => agregar(e.id)}>
                        <Icono nombre="descargar" className="size-5" /> Agregar a mi calendario
                      </Boton>
                    </Acciones>
                  </Tarjeta>
                ))}
              </section>
            ))
          )}
        </div>
      </Contenido>
    </>
  );
}
