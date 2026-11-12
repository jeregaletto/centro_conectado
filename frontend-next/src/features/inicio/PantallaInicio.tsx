"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Icono } from "@/components/ui/Icono";
import { Vacio } from "@/components/ui/Mensaje";
import { Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { BarraAvance, Seccion } from "@/components/ui/Varios";
import { useAccion } from "@/features/comun/hooks";
import { TarjetaAviso } from "@/features/avisos/TarjetaAviso";
import { api } from "@/lib/api";
import { plural } from "@/lib/etiquetas";
import { fechaLarga, hora } from "@/lib/fechas";
import { esDelAviso } from "@/lib/notificaciones";
import type { Aviso, Inicio } from "@/lib/tipos";
import { useSesion, useUsuario } from "@/stores/usuario";

/**
 * Marca un aviso como leído y baja las notificaciones que hablan de ese aviso.
 * El backend no lo hace solo (ver PENDIENTES.md), así que la campanita bajaría recién al abrir Notificaciones.
 */
async function marcarAvisoLeido(id: number): Promise<{ aviso: Aviso; notificacionesLeidas: number }> {
  const aviso = await api.avisos.marcarLeido(id);
  let notificacionesLeidas = 0;
  try {
    const pendientes = (await api.notificaciones.listar(true)).filter((n) => esDelAviso(n.link, id));
    await Promise.all(pendientes.map((n) => api.notificaciones.marcarLeida(n.id)));
    notificacionesLeidas = pendientes.length;
  } catch {
    // Si falla, el aviso igual quedó leído; la campanita se corrige en el próximo refresco.
  }
  return { aviso, notificacionesLeidas };
}

export function PantallaInicio({ inicio, avisoResaltado }: { inicio: Inicio; avisoResaltado: number | null }) {
  const usuario = useUsuario();
  const descontar = useSesion((s) => s.descontar);
  const avisar = useAvisos();
  const { ocupadoEn, correr } = useAccion();
  const [fijados, setFijados] = useState(inicio.fijados);
  const [novedades, setNovedades] = useState(inicio.novedades);
  const simple = usuario.vista === "SIMPLE";

  useEffect(() => {
    if (avisoResaltado) document.getElementById(`aviso-${avisoResaltado}`)?.scrollIntoView({ block: "center" });
  }, [avisoResaltado]);

  async function leer(id: number) {
    const r = await correr(`leer-${id}`, () => marcarAvisoLeido(id));
    if (!r.ok) {
      avisar(r.error, "error");
      return;
    }
    const reemplazar = (lista: Aviso[]) => lista.map((a) => (a.id === id ? r.valor.aviso : a));
    setFijados(reemplazar);
    setNovedades(reemplazar);
    if (r.valor.notificacionesLeidas > 0) descontar(r.valor.notificacionesLeidas);
    avisar("Listo, quedó como leído");
  }

  const aviso = (a: Aviso) => (
    <TarjetaAviso
      key={a.id}
      aviso={a}
      resaltado={a.id === avisoResaltado}
      acciones={
        a.requiereLectura && !a.leido ? (
          <Boton ocupado={ocupadoEn === `leer-${a.id}`} onClick={() => leer(a.id)}>
            Marcar como leído
          </Boton>
        ) : undefined
      }
    >
      {a.requiereLectura && a.leido && <Meta>Leído</Meta>}
    </TarjetaAviso>
  );

  const tareas = inicio.tareasHoy;
  return (
    <>
      <Encabezado
        antetitulo={`${inicio.saludo} · ${fechaLarga(inicio.fecha)}`}
        titulo={inicio.nombre}
        subtitulo={`${inicio.rolEtiqueta} · ${usuario.sector.nombre}`}
      />
      <Contenido>
        {tareas && tareas.total > 0 && (
          <Link href="/mi-puesto" className="mb-3.5 block rounded-cc bg-papel p-4 text-tinta no-underline">
            <p className="mb-2 text-xl font-bold">
              {tareas.hechas === tareas.total
                ? `¡Listo! Hiciste las ${tareas.total} tareas de hoy`
                : `Hiciste ${tareas.hechas} de ${tareas.total} tareas`}
            </p>
            <BarraAvance avance={tareas} etiqueta="Avance de tus tareas de hoy" />
            <Meta>Tocá para ir a Mi puesto</Meta>
          </Link>
        )}

        {inicio.pedidosPendientes > 0 && (
          <Tarjeta href="/pedidos" acento="senal">
            <TituloTarjeta>
              <span className="inline-flex items-center gap-2">
                <Icono nombre="flechas" />
                {plural(inicio.pedidosPendientes, "pedido pendiente", "pedidos pendientes")} para tu área
              </span>
            </TituloTarjeta>
            <Meta>Tocá para verlos</Meta>
          </Tarjeta>
        )}

        <Seccion titulo="Importante" id="t-importante">
          {fijados.length ? fijados.map(aviso) : <Vacio>No hay avisos importantes. Todo al día.</Vacio>}
        </Seccion>

        <Seccion titulo="Agenda de hoy" id="t-agenda">
          {inicio.agendaHoy.length ? (
            inicio.agendaHoy.map((e) => (
              <Tarjeta key={e.id} href={`/agenda?evento=${e.id}`}>
                <TituloTarjeta>
                  {hora(e.inicio)} · {e.titulo}
                </TituloTarjeta>
                {e.lugar && (
                  <Meta className="flex items-center gap-1">
                    <Icono nombre="lugar" className="size-4" /> {e.lugar}
                  </Meta>
                )}
              </Tarjeta>
            ))
          ) : (
            <Vacio>Hoy no hay eventos.</Vacio>
          )}
          {!simple && (
            <p>
              <Link href="/agenda" className="font-bold">
                Ver toda la agenda
              </Link>
            </p>
          )}
        </Seccion>

        <Seccion titulo="Novedades" id="t-novedades">
          {novedades.length ? novedades.map(aviso) : <Vacio>Sin novedades esta semana.</Vacio>}
        </Seccion>
      </Contenido>
    </>
  );
}
