"use client";

import { useRef, useState } from "react";

import { Boton, type VarianteBoton } from "@/components/ui/Boton";
import { Campo, claseTextarea } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Mensaje } from "@/components/ui/Mensaje";
import { Chip, Meta, Tarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { Seccion } from "@/components/ui/Varios";
import { useEnvio } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { ESTADO_PEDIDO, PRIORIDAD, TIPO_PEDIDO, TONO_PEDIDO } from "@/lib/etiquetas";
import { fechaHora } from "@/lib/fechas";
import type { PedidoDetalle } from "@/lib/tipos";
import { accionPedidoSchema, type AccionPedido } from "./schema";

const CAMPOS = ["comentario"] as const;

/** Qué botones existen: lo deciden `puedoCambiarEstado` y `puedoCancelar` del backend. */
function botones(d: PedidoDetalle): { accion: AccionPedido; texto: string; variante: VarianteBoton }[] {
  const p = d.pedido;
  const abierto = p.estado === "PENDIENTE" || p.estado === "EN_CURSO";
  if (!abierto) return [];
  const b: { accion: AccionPedido; texto: string; variante: VarianteBoton }[] = [];
  if (d.puedoCambiarEstado && p.estado === "PENDIENTE") b.push({ accion: "EN_CURSO", texto: "Tomar pedido", variante: "primario" });
  if (d.puedoCambiarEstado) b.push({ accion: "RESUELTO", texto: "Resolver", variante: "primario" });
  if (d.puedoCambiarEstado) b.push({ accion: "RECHAZADO", texto: "Rechazar", variante: "peligro" });
  if (d.puedoCancelar) b.push({ accion: "CANCELADO", texto: "Cancelar pedido", variante: "peligro" });
  b.push({ accion: "COMENTAR", texto: "Solo comentar", variante: "secundario" });
  return b;
}

export function PantallaPedido({ inicial }: { inicial: PedidoDetalle }) {
  const [d, setD] = useState(inicial);
  const [accionEnCurso, setAccionEnCurso] = useState<AccionPedido | null>(null);
  const avisar = useAvisos();
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS);
  const comentario = useRef<HTMLTextAreaElement>(null);
  const p = d.pedido;
  const acciones = botones(d);

  async function ejecutar(accion: AccionPedido) {
    setAccionEnCurso(accion);
    const r = await enviar(accionPedidoSchema, { accion, comentario: comentario.current?.value ?? "" }, (v) =>
      v.accion === "COMENTAR"
        ? api.pedidos.comentar(p.id, v.comentario)
        : api.pedidos.cambiarEstado(p.id, v.accion, v.comentario || null),
    );
    setAccionEnCurso(null);
    if (r) {
      setD(r);
      if (comentario.current) comentario.current.value = "";
      avisar(accion === "COMENTAR" ? "Comentario agregado" : "Pedido actualizado");
    } else if (comentario.current && !comentario.current.value.trim()) {
      comentario.current.focus();
    }
  }

  const plazo =
    p.horasRestantes === null
      ? p.cerradoEn
        ? `Cerrado el ${fechaHora(p.cerradoEn)}`
        : ""
      : p.vencido
        ? `Vencido hace ${Math.abs(p.horasRestantes)} h (plazo: ${fechaHora(p.plazo)})`
        : `Plazo: ${fechaHora(p.plazo)} (faltan ${p.horasRestantes} h)`;

  return (
    <>
      <Encabezado titulo={p.asunto} subtitulo={`${p.codigo} · ${TIPO_PEDIDO[p.tipo]}`} volver="/pedidos" />
      <Contenido>
        <Tarjeta acento={p.vencido ? "error" : "neutro"}>
          <Chip tono={TONO_PEDIDO[p.estado]}>{ESTADO_PEDIDO[p.estado]}</Chip>
          <Chip tono={p.prioridad === "ALTA" ? "error" : "neutro"}>Prioridad {PRIORIDAD[p.prioridad].toLowerCase()}</Chip>
          <p className="mt-1.5 whitespace-pre-line">{p.detalle}</p>
          <Meta>
            De <strong>{p.sectorOrigen.nombre}</strong> ({p.creadoPor}) para <strong>{p.sectorDestino.nombre}</strong>
          </Meta>
          {p.asignadoA && <Meta>Asignado a {p.asignadoA}</Meta>}
          <Meta>Creado el {fechaHora(p.creadoEn)}</Meta>
          <Meta className={p.vencido ? "font-bold text-error" : ""}>{plazo}</Meta>
        </Tarjeta>

        {acciones.length > 0 && (
          <form noValidate aria-label="Acciones del pedido" className="mb-4 rounded-cc bg-papel p-4" onSubmit={(e) => e.preventDefault()}>
            <Mensaje tipo="error">{general}</Mensaje>
            <Campo
              nombre="comentario"
              etiqueta="Comentario"
              error={errores.comentario}
              ayuda="Opcional al tomar o resolver. Obligatorio para rechazar. No escribas nombres ni DNI de pacientes."
            >
              {(pr) => <textarea {...pr} ref={comentario} maxLength={1000} className={claseTextarea} />}
            </Campo>
            <div className="flex flex-wrap gap-2">
              {acciones.map((b) => (
                <Boton
                  key={b.accion}
                  variante={b.variante}
                  ocupado={ocupado && accionEnCurso === b.accion}
                  disabled={ocupado}
                  onClick={() => ejecutar(b.accion)}
                >
                  {b.texto}
                </Boton>
              ))}
            </div>
          </form>
        )}

        <Seccion titulo="Historial" id="t-historial">
          <ol className="ml-2 border-l-[3px] border-pared-2 pl-4">
            {d.historial.length === 0 && <li className="text-tinta-suave">Sin movimientos todavía.</li>}
            {d.historial.map((m) => (
              <li
                key={m.id}
                className="relative pb-3.5 before:absolute before:top-1.5 before:-left-6 before:size-3.5 before:rounded-full before:bg-borde"
              >
                <strong>
                  {m.estadoNuevo && m.estadoNuevo !== m.estadoAnterior ? ESTADO_PEDIDO[m.estadoNuevo] : "Comentario"}
                </strong>{" "}
                <span className="text-[15px] text-tinta-suave">
                  · {m.usuario} · {fechaHora(m.creadoEn)}
                </span>
                {m.comentario && <p className="mt-1 whitespace-pre-line">{m.comentario}</p>}
              </li>
            ))}
          </ol>
        </Seccion>
      </Contenido>
    </>
  );
}
