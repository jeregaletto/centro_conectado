"use client";

import { useState } from "react";

import { DatosContacto } from "@/components/Contacto";
import { Campo, claseEntrada } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { Pestanas } from "@/components/ui/Varios";
import { useConsulta, useRetardo } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { plural } from "@/lib/etiquetas";
import type { AQuienAcudir, Contacto, Sector } from "@/lib/tipos";

type Seccion = "personas" | "acudir" | "sectores";

interface Props {
  personasIniciales: Contacto[];
  sectores: Sector[];
  aQuienAcudir: AQuienAcudir[];
  errorSecundario: string | null;
}

export function PantallaQuien({ personasIniciales, sectores, aQuienAcudir, errorSecundario }: Props) {
  const [seccion, setSeccion] = useState<Seccion>("personas");
  const [q, setQ] = useState("");
  const [sectorId, setSectorId] = useState("");
  const qRetardado = useRetardo(q.trim());
  const { datos: personas, error, cargando } = useConsulta(
    `${qRetardado}|${sectorId}`,
    () => api.directorio.buscar(qRetardado || undefined, sectorId ? Number(sectorId) : undefined),
    personasIniciales,
  );

  return (
    <>
      <Encabezado titulo="Quién es quién" subtitulo="Contactos del Centro y a quién acudir" volver="/mas" />
      <Contenido>
        <Pestanas
          etiqueta="Secciones"
          opciones={[
            { valor: "personas", texto: "Personas" },
            { valor: "acudir", texto: "¿A quién acudo?" },
            { valor: "sectores", texto: "Sectores" },
          ]}
          activa={seccion}
          alCambiar={setSeccion}
          panel="panel-quien"
        />
        <Mensaje tipo="error">{seccion !== "personas" ? errorSecundario : error}</Mensaje>

        <div id="panel-quien" role="tabpanel">
          {seccion === "personas" && (
            <>
              <div className="grid gap-x-2 sm:grid-cols-[2fr_1fr]">
                <Campo nombre="q" etiqueta="Buscar por nombre o puesto" etiquetaOculta>
                  {(p) => (
                    <input
                      {...p}
                      type="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por nombre o puesto"
                      autoComplete="off"
                      className={claseEntrada}
                    />
                  )}
                </Campo>
                <Campo nombre="sector" etiqueta="Sector" etiquetaOculta>
                  {(p) => (
                    <select {...p} value={sectorId} onChange={(e) => setSectorId(e.target.value)} className={claseEntrada}>
                      <option value="">Todos los sectores</option>
                      {sectores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </Campo>
              </div>
              <div aria-live="polite" aria-busy={cargando}>
                {cargando ? (
                  <Cargando texto="Buscando…" />
                ) : !personas || personas.length === 0 ? (
                  !error && <Vacio>No encontramos a nadie con esa búsqueda. Probá con otro nombre o sector.</Vacio>
                ) : (
                  <ul>
                    {personas.map((c) => (
                      <Tarjeta key={c.id} como="li">
                        <DatosContacto contacto={c} />
                      </Tarjeta>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {seccion === "acudir" &&
            (aQuienAcudir.length === 0 ? (
              <Vacio>Todavía no hay temas cargados.</Vacio>
            ) : (
              <ul>
                {aQuienAcudir.map((a) => (
                  <Tarjeta key={a.id} como="li">
                    {a.sector && <Chip>{a.sector.nombre}</Chip>}
                    <TituloTarjeta>{a.tema}</TituloTarjeta>
                    {a.descripcion && <p className="mt-1">{a.descripcion}</p>}
                    {a.contacto && (
                      <div className="mt-3 border-t border-pared-2 pt-3">
                        <DatosContacto contacto={a.contacto} />
                      </div>
                    )}
                  </Tarjeta>
                ))}
              </ul>
            ))}

          {seccion === "sectores" &&
            (sectores.length === 0 ? (
              <Vacio>No hay sectores cargados.</Vacio>
            ) : (
              <ul>
                {sectores.map((s) => (
                  <Tarjeta key={s.id} como="li">
                    <Chip>{plural(s.integrantes, "persona", "personas")}</Chip>
                    <TituloTarjeta>{s.nombre}</TituloTarjeta>
                    {s.descripcion && <p className="mt-1">{s.descripcion}</p>}
                    {s.referente ? (
                      <div className="mt-3 border-t border-pared-2 pt-3">
                        <Meta className="font-bold">Referente</Meta>
                        <DatosContacto contacto={s.referente} />
                      </div>
                    ) : (
                      <Meta>Sin referente asignado</Meta>
                    )}
                  </Tarjeta>
                ))}
              </ul>
            ))}
        </div>
      </Contenido>
    </>
  );
}
