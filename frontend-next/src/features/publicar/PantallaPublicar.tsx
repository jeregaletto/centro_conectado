"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada, claseTextarea, GrupoOpciones, Opcion } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Meta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { BarraAvance, Pestanas, Seccion } from "@/components/ui/Varios";
import { marcado, numeros, texto, textoONull } from "@/features/comun/formularios";
import { useAccion, useConsulta, useEnvio } from "@/features/comun/hooks";
import { TarjetaAviso } from "@/features/avisos/TarjetaAviso";
import { api } from "@/lib/api";
import { finDelDia, sumarMinutos } from "@/lib/fechas";
import { tiene } from "@/lib/permisos";
import type { Aviso, Lecturas, Sector } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";
import { avisoSchema, eventoSchema, type Alcance } from "./schema";

export type PestanaPublicar = "aviso" | "evento" | "publicados";

export function PantallaPublicar({ sectores, pestanaInicial }: { sectores: Sector[]; pestanaInicial: PestanaPublicar }) {
  const usuario = useUsuario();
  const [pestana, setPestana] = useState<PestanaPublicar>(pestanaInicial);
  const alcance: Alcance = { general: tiene(usuario, "PUBLICAR_GENERAL"), sectorPropio: usuario.sector.id };

  return (
    <>
      <Encabezado
        titulo="Publicar"
        subtitulo={alcance.general ? "Podés publicar para todo el Centro o para sectores" : `Como referente publicás para ${usuario.sector.nombre}`}
        volver="/mas"
      />
      <Contenido>
        <Pestanas
          etiqueta="Qué publicar"
          opciones={[
            { valor: "aviso", texto: "Aviso" },
            { valor: "evento", texto: "Evento" },
            { valor: "publicados", texto: "Publicados" },
          ]}
          activa={pestana}
          alCambiar={setPestana}
          panel="panel-publicar"
        />
        <div id="panel-publicar" role="tabpanel">
          {pestana === "aviso" && <FormAviso sectores={sectores} alcance={alcance} alPublicar={() => setPestana("publicados")} />}
          {pestana === "evento" && <FormEvento sectores={sectores} alcance={alcance} />}
          {pestana === "publicados" && <Publicados general={alcance.general} />}
        </div>
      </Contenido>
    </>
  );
}

/** "¿Para quién?": con PUBLICAR_GENERAL, cualquier sector (ninguno = todo el Centro). El referente ve solo el suyo. */
function Destinatarios({ sectores, alcance, error }: { sectores: Sector[]; alcance: Alcance; error?: string }) {
  const usuario = useUsuario();
  if (!alcance.general) {
    return (
      <GrupoOpciones nombre="sectorIds" leyenda="¿Para quién?" error={error} ayuda="Como referente, lo que publicás va a tu sector.">
        <Opcion>
          <input type="checkbox" name="sectorIds" value={alcance.sectorPropio} checked readOnly aria-readonly="true" onClick={(e) => e.preventDefault()} />
          {usuario.sector.nombre}
        </Opcion>
      </GrupoOpciones>
    );
  }
  return (
    <GrupoOpciones nombre="sectorIds" leyenda="¿Para quién?" error={error} ayuda="Sin marcar ninguno = todo el Centro.">
      {sectores.map((s) => (
        <Opcion key={s.id}>
          <input type="checkbox" name="sectorIds" value={s.id} /> {s.nombre}
        </Opcion>
      ))}
    </GrupoOpciones>
  );
}

const CAMPOS_AVISO = ["titulo", "cuerpo", "tipo", "fijado", "requiereLectura", "vigenteHasta", "sectorIds"] as const;

function FormAviso({ sectores, alcance, alPublicar }: { sectores: Sector[]; alcance: Alcance; alPublicar: () => void }) {
  const avisar = useAvisos();
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS_AVISO);
  return (
    <form
      noValidate
      aria-label="Publicar aviso"
      className="mb-4 rounded-cc bg-papel p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const d = new FormData(form);
        const vigencia = texto(d, "vigenteHasta");
        const r = await enviar(
          avisoSchema(alcance),
          {
            titulo: texto(d, "titulo"),
            cuerpo: texto(d, "cuerpo"),
            tipo: texto(d, "tipo"),
            fijado: marcado(d, "fijado"),
            requiereLectura: marcado(d, "requiereLectura"),
            vigenteHasta: vigencia ? finDelDia(vigencia) : null,
            sectorIds: numeros(d, "sectorIds"),
          },
          (v) => api.avisos.crear(v),
        );
        if (r) {
          form.reset();
          avisar("Aviso publicado");
          alPublicar();
        }
      }}
    >
      <Mensaje tipo="error">{general}</Mensaje>
      <GrupoOpciones
        nombre="tipo"
        leyenda="Tipo de aviso"
        error={errores.tipo}
        ayuda="Cambio de horario y Urgente envían una notificación a los destinatarios."
      >
        <Opcion>
          <input type="radio" name="tipo" value="NOVEDAD" defaultChecked /> Novedad
        </Opcion>
        <Opcion>
          <input type="radio" name="tipo" value="CAMBIO_HORARIO" /> Cambio de horario
        </Opcion>
        <Opcion>
          <input type="radio" name="tipo" value="URGENTE" /> Urgente
        </Opcion>
      </GrupoOpciones>
      <Campo nombre="titulo" etiqueta="Título" error={errores.titulo}>
        {(p) => <input {...p} maxLength={150} className={claseEntrada} />}
      </Campo>
      <Campo nombre="cuerpo" etiqueta="Texto" error={errores.cuerpo}>
        {(p) => <textarea {...p} maxLength={4000} className={claseTextarea} />}
      </Campo>
      <div className="mb-4 flex flex-wrap gap-2">
        <Opcion>
          <input type="checkbox" name="fijado" /> Fijar arriba en Inicio
        </Opcion>
        <Opcion>
          <input type="checkbox" name="requiereLectura" /> Pedir confirmación de lectura
        </Opcion>
      </div>
      <Campo nombre="vigenteHasta" etiqueta="Vigente hasta" error={errores.vigenteHasta} ayuda="Si lo dejás vacío vence a los 30 días. Máximo 180 días.">
        {(p) => <input {...p} type="date" className={claseEntrada} />}
      </Campo>
      <Destinatarios sectores={sectores} alcance={alcance} error={errores.sectorIds} />
      <Boton type="submit" ancho ocupado={ocupado}>
        Publicar aviso
      </Boton>
    </form>
  );
}

const CAMPOS_EVENTO = ["titulo", "descripcion", "tipo", "lugar", "inicio", "fin", "recordatorioMinutos", "sectorIds"] as const;

function FormEvento({ sectores, alcance }: { sectores: Sector[]; alcance: Alcance }) {
  const router = useRouter();
  const avisar = useAvisos();
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS_EVENTO);
  const [fin, setFin] = useState("");

  return (
    <form
      noValidate
      aria-label="Publicar evento"
      className="mb-4 rounded-cc bg-papel p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const recordatorio = texto(d, "recordatorioMinutos");
        const ev = await enviar(
          eventoSchema(alcance),
          {
            titulo: texto(d, "titulo"),
            descripcion: textoONull(d, "descripcion"),
            tipo: texto(d, "tipo"),
            lugar: textoONull(d, "lugar"),
            inicio: texto(d, "inicio"),
            fin: texto(d, "fin"),
            recordatorioMinutos: recordatorio ? Number(recordatorio) : null,
            sectorIds: numeros(d, "sectorIds"),
          },
          (v) => api.agenda.crear(v),
        );
        if (ev) {
          avisar("Evento publicado");
          router.push(`/agenda?evento=${ev.id}`);
        }
      }}
    >
      <Mensaje tipo="error">{general}</Mensaje>
      <GrupoOpciones nombre="tipo" leyenda="Tipo de evento" error={errores.tipo}>
        <Opcion>
          <input type="radio" name="tipo" value="EVENTO" defaultChecked /> Evento
        </Opcion>
        <Opcion>
          <input type="radio" name="tipo" value="CAPACITACION" /> Capacitación
        </Opcion>
        <Opcion>
          <input type="radio" name="tipo" value="REUNION" /> Reunión
        </Opcion>
      </GrupoOpciones>
      <Campo nombre="titulo" etiqueta="Título" error={errores.titulo}>
        {(p) => <input {...p} maxLength={150} className={claseEntrada} />}
      </Campo>
      <Campo nombre="descripcion" etiqueta="Descripción" error={errores.descripcion}>
        {(p) => <textarea {...p} maxLength={2000} className={claseTextarea} />}
      </Campo>
      <Campo nombre="lugar" etiqueta="Lugar" error={errores.lugar}>
        {(p) => <input {...p} maxLength={150} placeholder="Ej: sala de reuniones, primer piso" className={claseEntrada} />}
      </Campo>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <Campo nombre="inicio" etiqueta="Empieza" error={errores.inicio}>
          {(p) => (
            <input
              {...p}
              type="datetime-local"
              className={claseEntrada}
              onChange={(e) => {
                // Si no hay fin (o quedó antes), proponemos una hora de duración.
                const v = e.target.value;
                if (v && (!fin || fin <= v)) setFin(sumarMinutos(v, 60));
              }}
            />
          )}
        </Campo>
        <Campo nombre="fin" etiqueta="Termina" error={errores.fin}>
          {(p) => <input {...p} type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} className={claseEntrada} />}
        </Campo>
      </div>
      <Campo nombre="recordatorioMinutos" etiqueta="Recordatorio" error={errores.recordatorioMinutos}>
        {(p) => (
          <select {...p} defaultValue="60" className={claseEntrada}>
            <option value="">Sin recordatorio</option>
            <option value="30">30 minutos antes</option>
            <option value="60">1 hora antes</option>
            <option value="1440">1 día antes</option>
          </select>
        )}
      </Campo>
      <Destinatarios sectores={sectores} alcance={alcance} error={errores.sectorIds} />
      <Boton type="submit" ancho ocupado={ocupado}>
        Publicar evento
      </Boton>
    </form>
  );
}

/** Lo publicado: por vencer (con marca) y vigentes, con lecturas, renovar y quitar. */
function Publicados({ general }: { general: boolean }) {
  const usuario = useUsuario();
  const avisar = useAvisos();
  const { ocupadoEn, correr } = useAccion();
  const [lecturas, setLecturas] = useState<Record<number, Lecturas>>({});
  const [confirmar, setConfirmar] = useState<number | null>(null);
  const nombre = `${usuario.nombre} ${usuario.apellido}`;
  const { datos, error, recargar } = useConsulta("publicados", async () => {
    const [porVencer, vigentes] = await Promise.all([api.avisos.porVencer(), api.avisos.listar()]);
    // El backend ya filtra "por vencer" por autor; la lista de vigentes la filtramos acá para el referente.
    return { porVencer, vigentes: general ? vigentes : vigentes.filter((a) => a.autor === nombre) };
  });
  const verLecturas = tiene(usuario, "VER_LECTURAS");

  async function accion(a: Aviso, tipo: "lecturas" | "renovar" | "quitar") {
    if (tipo === "quitar" && confirmar !== a.id) {
      setConfirmar(a.id);
      return;
    }
    const id = `${tipo}-${a.id}`;
    if (tipo === "lecturas") {
      const r = await correr(id, () => api.avisos.lecturas(a.id));
      if (r.ok) setLecturas((l) => ({ ...l, [a.id]: r.valor }));
      else avisar(r.error, "error");
      return;
    }
    const r = await correr(id, async () => {
      if (tipo === "renovar") await api.avisos.renovar(a.id);
      else await api.avisos.eliminar(a.id);
    });
    setConfirmar(null);
    avisar(r.ok ? (tipo === "renovar" ? "Aviso renovado 30 días" : "Aviso quitado") : r.error, r.ok ? "ok" : "error");
    if (r.ok) recargar();
  }

  const tarjeta = (a: Aviso) => {
    const l = lecturas[a.id];
    return (
      <TarjetaAviso
        key={a.id}
        aviso={a}
        mostrarVigencia
        acciones={
          <>
            {verLecturas && a.requiereLectura && (
              <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === `lecturas-${a.id}`} onClick={() => accion(a, "lecturas")}>
                Ver lecturas
              </Boton>
            )}
            <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === `renovar-${a.id}`} onClick={() => accion(a, "renovar")}>
              Renovar 30 días
            </Boton>
            <Boton variante="peligro" tamano="chico" ocupado={ocupadoEn === `quitar-${a.id}`} onClick={() => accion(a, "quitar")}>
              {confirmar === a.id ? "¿Seguro? Tocá de nuevo" : "Quitar"}
            </Boton>
          </>
        }
      >
        {l && (
          <div className="mt-2.5" aria-live="polite">
            <Meta className="font-bold">
              Leyeron {l.leyeron} de {l.destinatarios} ({l.porcentaje}%)
            </Meta>
            <div className="mt-1.5">
              <BarraAvance avance={{ hechas: l.leyeron, total: l.destinatarios, porcentaje: l.porcentaje }} etiqueta="Lecturas del aviso" />
            </div>
            <Meta>{l.pendientes.length ? `Falta: ${l.pendientes.map((p) => p.nombre).join(", ")}` : "Lo leyeron todos"}</Meta>
          </div>
        )}
      </TarjetaAviso>
    );
  };

  if (error) return <Mensaje tipo="error">{error}</Mensaje>;
  if (!datos) return <Cargando />;
  return (
    <>
      <Seccion titulo="Por vencer" id="t-por-vencer">
        {datos.porVencer.length ? datos.porVencer.map(tarjeta) : <Vacio>Nada por vencer en los próximos días.</Vacio>}
      </Seccion>
      <Seccion titulo="Avisos vigentes" id="t-vigentes">
        {datos.vigentes.length ? (
          datos.vigentes.map(tarjeta)
        ) : (
          <Vacio>Todavía no publicaste avisos. Usá la pestaña Aviso para empezar.</Vacio>
        )}
      </Seccion>
    </>
  );
}
