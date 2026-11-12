"use client";

import { useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada } from "@/components/ui/Campo";
import { Icono } from "@/components/ui/Icono";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Acciones, Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { BarraAvance, Plegable, Seccion } from "@/components/ui/Varios";
import { texto, textoONull } from "@/features/comun/formularios";
import { useAccion, useConsulta, useEnvio } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { esNombreIcono, ICONOS_TAREA } from "@/lib/iconos";
import { tiene } from "@/lib/permisos";
import type { Sector } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";
import { tareaSchema } from "./schema";

const CAMPOS = ["titulo", "descripcion", "icono", "frecuencia", "puesto", "orden", "sectorId"] as const;

/** Avance del día por persona y checklist del sector. El referente solo ve el suyo. */
export function SeccionTareas({ sectores }: { sectores: Sector[] }) {
  const usuario = useUsuario();
  const general = tiene(usuario, "GESTIONAR_TAREAS_GENERAL");
  const avisar = useAvisos();
  const { ocupadoEn, correr } = useAccion();
  const [sectorId, setSectorId] = useState<number>(usuario.sector.id);
  const [confirmar, setConfirmar] = useState<number | null>(null);
  const envio = useEnvio(CAMPOS);

  const { datos, error, cargando, recargar } = useConsulta(`tareas|${sectorId}`, async () => {
    const [avance, tareas] = await Promise.all([api.puesto.avanceSector(sectorId), api.puesto.tareasSector(sectorId)]);
    return { avance: avance.filter((a) => a.avance.total > 0), tareas };
  });

  async function quitar(id: number) {
    if (confirmar !== id) {
      setConfirmar(id);
      return;
    }
    const r = await correr(`quitar-${id}`, () => api.puesto.eliminarTarea(id));
    setConfirmar(null);
    avisar(r.ok ? "Tarea quitada" : r.error, r.ok ? "ok" : "error");
    if (r.ok) recargar();
  }

  return (
    <>
      {general && (
        <Campo nombre="tareas-sector" etiqueta="Sector">
          {(p) => (
            <select {...p} value={sectorId} onChange={(e) => setSectorId(Number(e.target.value))} className={claseEntrada}>
              {sectores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          )}
        </Campo>
      )}
      <Mensaje tipo="error">{error}</Mensaje>
      {cargando || !datos ? (
        !error && <Cargando />
      ) : (
        <>
          <Seccion titulo="Avance de hoy" id="t-avance">
            {datos.avance.length === 0 ? (
              <Vacio>Nadie del sector tiene tareas asignadas hoy.</Vacio>
            ) : (
              <ul>
                {datos.avance.map((a) => (
                  <li key={a.usuario.id} className="mb-2 rounded-cc bg-papel px-3.5 py-3">
                    <div className="mb-1.5 flex justify-between gap-2">
                      <span>
                        <strong>{a.usuario.nombre}</strong> <span className="text-tinta-suave">· {a.usuario.puesto}</span>
                      </span>
                      <strong>
                        {a.avance.hechas}/{a.avance.total}
                      </strong>
                    </div>
                    <BarraAvance avance={a.avance} etiqueta={`Avance de ${a.usuario.nombre}`} />
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          <Seccion titulo="Checklist del sector" id="t-checklist">
            {datos.tareas.length === 0 ? (
              <Vacio>El sector no tiene tareas. Agregá la primera abajo.</Vacio>
            ) : (
              <ul>
                {datos.tareas.map((t) => (
                  <Tarjeta key={t.id} como="li">
                    <Chip>{t.frecuencia === "SEMANAL" ? "Semanal" : "Diaria"}</Chip>
                    {t.puesto && <Chip>{t.puesto}</Chip>}
                    <TituloTarjeta>
                      <span className="inline-flex items-center gap-2">
                        <Icono nombre={esNombreIcono(t.icono) ? t.icono : "check"} />
                        {t.titulo}
                      </span>
                    </TituloTarjeta>
                    {t.descripcion && <Meta>{t.descripcion}</Meta>}
                    <Acciones>
                      <Boton variante="peligro" tamano="chico" ocupado={ocupadoEn === `quitar-${t.id}`} onClick={() => quitar(t.id)}>
                        {confirmar === t.id ? "¿Seguro? Tocá de nuevo" : "Quitar"}
                      </Boton>
                    </Acciones>
                  </Tarjeta>
                ))}
              </ul>
            )}
          </Seccion>
        </>
      )}

      <Plegable titulo="Agregar tarea">
        <form
          noValidate
          aria-label="Agregar tarea"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const d = new FormData(form);
            const r = await envio.enviar(
              tareaSchema,
              {
                sectorId,
                puesto: textoONull(d, "puesto"),
                titulo: texto(d, "titulo"),
                descripcion: textoONull(d, "descripcion"),
                icono: texto(d, "icono"),
                frecuencia: texto(d, "frecuencia"),
                orden: Number(texto(d, "orden") || 0),
              },
              (v) => api.puesto.crearTarea(v),
            );
            if (r) {
              form.reset();
              avisar("Tarea agregada");
              recargar();
            }
          }}
        >
          <Mensaje tipo="error">{envio.general}</Mensaje>
          <Campo nombre="titulo" etiqueta="Tarea" error={envio.errores.titulo}>
            {(p) => <input {...p} maxLength={120} placeholder="Ej: limpiar baños de planta baja" className={claseEntrada} />}
          </Campo>
          <Campo nombre="descripcion" etiqueta="Ayuda (opcional)" error={envio.errores.descripcion}>
            {(p) => <input {...p} maxLength={500} className={claseEntrada} />}
          </Campo>
          <div className="grid gap-x-3 sm:grid-cols-2">
            <Campo nombre="icono" etiqueta="Ícono" error={envio.errores.icono}>
              {(p) => (
                <select {...p} className={claseEntrada}>
                  {Object.entries(ICONOS_TAREA).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo nombre="frecuencia" etiqueta="Frecuencia" error={envio.errores.frecuencia}>
              {(p) => (
                <select {...p} className={claseEntrada}>
                  <option value="DIARIA">Todos los días</option>
                  <option value="SEMANAL">Una vez por semana</option>
                </select>
              )}
            </Campo>
          </div>
          <div className="grid gap-x-3 sm:grid-cols-2">
            <Campo nombre="puesto" etiqueta="Solo para el puesto (opcional)" error={envio.errores.puesto} ayuda="Vacío = todo el sector.">
              {(p) => <input {...p} maxLength={80} className={claseEntrada} />}
            </Campo>
            <Campo nombre="orden" etiqueta="Orden" error={envio.errores.orden}>
              {(p) => <input {...p} type="number" min={0} defaultValue={0} className={claseEntrada} />}
            </Campo>
          </div>
          <Boton type="submit" ancho ocupado={envio.ocupado}>
            Agregar tarea
          </Boton>
        </form>
      </Plegable>
    </>
  );
}
