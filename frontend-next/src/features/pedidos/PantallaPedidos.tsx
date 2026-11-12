"use client";

import { useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada, claseTextarea, GrupoOpciones, Opcion } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { Pestanas, Plegable } from "@/components/ui/Varios";
import { texto } from "@/features/comun/formularios";
import { useConsulta, useEnvio } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { ESTADO_PEDIDO, TONO_PEDIDO } from "@/lib/etiquetas";
import { fecha } from "@/lib/fechas";
import { tiene } from "@/lib/permisos";
import type { EstadoPedido, Pedido, Sector } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";
import { crearPedidoSchema } from "./schema";

type Bandeja = "recibidos" | "enviados" | "todos";

export function plazoTexto(p: Pedido): string {
  if (p.horasRestantes === null) return p.cerradoEn ? `Cerrado el ${fecha(p.cerradoEn)}` : "";
  if (p.vencido) return `Vencido hace ${Math.abs(p.horasRestantes)} h`;
  return p.horasRestantes < 24 ? `Vence en ${p.horasRestantes} h` : `Vence el ${fecha(p.plazo)}`;
}

const VACIO: Record<Bandeja, string> = {
  recibidos: "Tu área no tiene pedidos.",
  enviados: "Todavía no hiciste pedidos. Tocá «Nuevo pedido» para empezar.",
  todos: "No hay pedidos con ese filtro.",
};

export function PantallaPedidos({ recibidosIniciales, sectores }: { recibidosIniciales: Pedido[]; sectores: Sector[] }) {
  const usuario = useUsuario();
  const [bandeja, setBandeja] = useState<Bandeja>("recibidos");
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const [nuevoAbierto, setNuevoAbierto] = useState(false);

  const clave = `${bandeja}|${estado}`;
  const { datos: pedidos, error, cargando, recargar } = useConsulta(
    clave,
    () => api.pedidos[bandeja](estado || undefined),
    recibidosIniciales,
  );

  const opciones = [
    { valor: "recibidos" as const, texto: "Recibidos" },
    { valor: "enviados" as const, texto: "Enviados" },
    ...(tiene(usuario, "VER_TODOS_LOS_PEDIDOS") ? [{ valor: "todos" as const, texto: "Todos" }] : []),
  ];

  const quien = (p: Pedido) =>
    bandeja === "recibidos"
      ? `De ${p.sectorOrigen.nombre}`
      : bandeja === "enviados"
        ? `Para ${p.sectorDestino.nombre}`
        : `${p.sectorOrigen.nombre} → ${p.sectorDestino.nombre}`;

  return (
    <>
      <Encabezado titulo="Pedidos entre áreas" subtitulo={`Tu área: ${usuario.sector.nombre}`} />
      <Contenido>
        <Plegable titulo="Nuevo pedido" abierto={nuevoAbierto} alCambiar={setNuevoAbierto}>
          <FormNuevoPedido
            sectores={sectores.filter((s) => s.id !== usuario.sector.id)}
            alCrear={() => {
              setNuevoAbierto(false);
              if (bandeja === "enviados") recargar();
              else setBandeja("enviados");
            }}
          />
        </Plegable>

        <Pestanas etiqueta="Bandejas de pedidos" opciones={opciones} activa={bandeja} alCambiar={setBandeja} panel="lista-pedidos" />
        <Campo nombre="filtro-estado" etiqueta="Filtrar por estado" etiquetaOculta>
          {(p) => (
            <select {...p} value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | "")} className={claseEntrada}>
              <option value="">Todos los estados</option>
              {(Object.keys(ESTADO_PEDIDO) as EstadoPedido[]).map((k) => (
                <option key={k} value={k}>
                  {ESTADO_PEDIDO[k]}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Mensaje tipo="error">{error}</Mensaje>
        <div id="lista-pedidos" role="tabpanel" aria-live="polite" aria-busy={cargando}>
          {cargando ? (
            <Cargando />
          ) : !pedidos || pedidos.length === 0 ? (
            !error && <Vacio>{VACIO[bandeja]}</Vacio>
          ) : (
            <ul>
              {pedidos.map((p) => (
                <li key={p.id}>
                  <Tarjeta href={`/pedidos/${p.id}`} acento={p.vencido ? "error" : "neutro"}>
                    <Chip tono={TONO_PEDIDO[p.estado]}>{ESTADO_PEDIDO[p.estado]}</Chip>
                    {p.prioridad === "ALTA" && <Chip tono="error">Prioridad alta</Chip>}
                    {p.tipo === "INTERCONSULTA" && <Chip>Interconsulta</Chip>}
                    <TituloTarjeta>{p.asunto}</TituloTarjeta>
                    <Meta>
                      {p.codigo} · {quien(p)} · {p.creadoPor}
                    </Meta>
                    <Meta className={p.vencido ? "font-bold text-error" : ""}>{plazoTexto(p)}</Meta>
                  </Tarjeta>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Contenido>
    </>
  );
}

const CAMPOS = ["tipo", "sectorDestinoId", "asunto", "detalle", "prioridad"] as const;

function FormNuevoPedido({ sectores, alCrear }: { sectores: Sector[]; alCrear: () => void }) {
  const avisar = useAvisos();
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS);

  return (
    <form
      noValidate
      aria-label="Nuevo pedido"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const d = new FormData(form);
        const destino = texto(d, "sectorDestinoId");
        const r = await enviar(
          crearPedidoSchema,
          {
            tipo: texto(d, "tipo"),
            sectorDestinoId: destino ? Number(destino) : undefined,
            asunto: texto(d, "asunto"),
            detalle: texto(d, "detalle"),
            prioridad: texto(d, "prioridad"),
          },
          (v) => api.pedidos.crear(v),
        );
        if (r) {
          form.reset();
          avisar(`Pedido ${r.pedido.codigo} enviado`);
          alCrear();
        }
      }}
    >
      <Mensaje tipo="error">{general}</Mensaje>
      <GrupoOpciones nombre="tipo" leyenda="¿Qué necesitás?" error={errores.tipo}>
        <Opcion>
          <input type="radio" name="tipo" value="PEDIDO" defaultChecked /> Pedido
        </Opcion>
        <Opcion>
          <input type="radio" name="tipo" value="INTERCONSULTA" /> Interconsulta
        </Opcion>
      </GrupoOpciones>
      <Campo nombre="sectorDestinoId" etiqueta="¿A qué área?" error={errores.sectorDestinoId}>
        {(p) => (
          <select {...p} defaultValue="" className={claseEntrada}>
            <option value="">Elegí un área</option>
            {sectores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo nombre="asunto" etiqueta="Asunto" error={errores.asunto}>
        {(p) => <input {...p} maxLength={150} placeholder="Ej: reponer guantes en habitación 12" className={claseEntrada} />}
      </Campo>
      <Campo
        nombre="detalle"
        etiqueta="Detalle"
        error={errores.detalle}
        ayuda={
          <span className="mt-1.5 block rounded-lg bg-alerta-fondo px-3 py-2 text-tinta">
            No escribas nombres ni DNI de pacientes. Usá «habitación 12» o «ver HC».
          </span>
        }
      >
        {(p) => <textarea {...p} maxLength={2000} className={claseTextarea} />}
      </Campo>
      <Campo nombre="prioridad" etiqueta="Prioridad" error={errores.prioridad}>
        {(p) => (
          <select {...p} defaultValue="MEDIA" className={claseEntrada}>
            <option value="MEDIA">Normal (72 h)</option>
            <option value="ALTA">Alta (24 h)</option>
            <option value="BAJA">Baja (7 días)</option>
          </select>
        )}
      </Campo>
      <Boton type="submit" ancho ocupado={ocupado}>
        Enviar pedido
      </Boton>
    </form>
  );
}
