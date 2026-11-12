"use client";

import { useEffect, useState } from "react";

import { Boton, EnlaceBoton } from "@/components/ui/Boton";
import { Campo, claseEntrada, claseTextarea } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Icono } from "@/components/ui/Icono";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Acciones, Chip, Meta, Tarjeta, TituloTarjeta } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { Plegable } from "@/components/ui/Varios";
import { texto, textoONull } from "@/features/comun/formularios";
import { useAccion, useConsulta, useEnvio, useRetardo } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { CATEGORIA_DOCUMENTO } from "@/lib/etiquetas";
import { diaDe, fecha, finDelDia } from "@/lib/fechas";
import { tiene } from "@/lib/permisos";
import type { CategoriaDocumento, Documento, Sector } from "@/lib/tipos";
import { useUsuario } from "@/stores/usuario";
import { documentoSchema } from "./schema";

const CATEGORIAS = Object.keys(CATEGORIA_DOCUMENTO) as CategoriaDocumento[];

interface Props {
  documentosIniciales: Documento[];
  sectores: Sector[];
  resaltado: number | null;
}

export function PantallaBiblioteca({ documentosIniciales, sectores, resaltado }: Props) {
  const usuario = useUsuario();
  const gestiona = tiene(usuario, "GESTIONAR_BIBLIOTECA");
  const avisar = useAvisos();
  const { ocupadoEn, correr } = useAccion();
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDocumento | "">("");
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [confirmarQuitar, setConfirmarQuitar] = useState<number | null>(null);
  const qRetardado = useRetardo(q.trim());

  const { datos: docs, error, cargando, recargar } = useConsulta(
    `${qRetardado}|${categoria}`,
    () => api.biblioteca.listar({ q: qRetardado || undefined, categoria: categoria || undefined }),
    documentosIniciales,
  );

  useEffect(() => {
    if (resaltado) document.getElementById(`doc-${resaltado}`)?.scrollIntoView({ block: "center" });
  }, [resaltado]);

  async function accion(id: number, tipo: "renovar" | "quitar") {
    if (tipo === "quitar" && confirmarQuitar !== id) {
      setConfirmarQuitar(id);
      return;
    }
    const r = await correr(`${tipo}-${id}`, async () => {
      if (tipo === "renovar") await api.biblioteca.renovar(id);
      else await api.biblioteca.eliminar(id);
    });
    setConfirmarQuitar(null);
    avisar(r.ok ? (tipo === "renovar" ? "Vigencia renovada 30 días" : "Documento quitado") : r.error, r.ok ? "ok" : "error");
    if (r.ok) recargar();
  }

  return (
    <>
      <Encabezado titulo="Biblioteca" subtitulo="Protocolos, manuales y documentos vigentes" volver="/mas" />
      <Contenido>
        {gestiona && (
          <Plegable titulo="Agregar documento" abierto={nuevoAbierto} alCambiar={setNuevoAbierto}>
            <FormDocumento
              sectores={sectores}
              alGuardar={() => {
                setNuevoAbierto(false);
                recargar();
              }}
            />
          </Plegable>
        )}

        <div className="grid gap-x-2 sm:grid-cols-[2fr_1fr]">
          <Campo nombre="q" etiqueta="Buscar documento" etiquetaOculta>
            {(p) => (
              <input
                {...p}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar documento"
                autoComplete="off"
                className={claseEntrada}
              />
            )}
          </Campo>
          <Campo nombre="categoria-filtro" etiqueta="Categoría" etiquetaOculta>
            {(p) => (
              <select
                {...p}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaDocumento | "")}
                className={claseEntrada}
              >
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_DOCUMENTO[c]}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>

        <Mensaje tipo="error">{error}</Mensaje>
        <div aria-live="polite" aria-busy={cargando}>
          {cargando ? (
            <Cargando texto="Buscando…" />
          ) : !docs || docs.length === 0 ? (
            !error && <Vacio>No hay documentos con esa búsqueda.</Vacio>
          ) : (
            <ul>
              {docs.map((d) => (
                <Tarjeta
                  key={d.id}
                  id={`doc-${d.id}`}
                  como="li"
                  acento={d.porVencer ? "alerta" : d.id === resaltado ? "senal" : "neutro"}
                  className={d.id === resaltado ? "ring-3 ring-senal" : ""}
                >
                  {editando === d.id ? (
                    <FormDocumento
                      documento={d}
                      sectores={sectores}
                      alCancelar={() => setEditando(null)}
                      alGuardar={() => {
                        setEditando(null);
                        recargar();
                      }}
                    />
                  ) : (
                    <>
                      <Chip>{CATEGORIA_DOCUMENTO[d.categoria]}</Chip>
                      {d.version && <Chip>{d.version}</Chip>}
                      {d.porVencer && <Chip tono="alerta">Por vencer</Chip>}
                      <TituloTarjeta>{d.titulo}</TituloTarjeta>
                      {d.descripcion && <p className="mt-1">{d.descripcion}</p>}
                      <Meta>
                        {d.sector ? d.sector.nombre : "Todo el Centro"} · Publicó {d.publicadoPor} · {fecha(d.publicadoEn)}
                        {gestiona ? ` · Vigente hasta ${fecha(d.vigenteHasta)}` : ""}
                      </Meta>
                      <Acciones>
                        <EnlaceBoton href={d.url} tamano="chico" externo>
                          <Icono nombre="documento" className="size-5" /> Abrir
                        </EnlaceBoton>
                        {gestiona && (
                          <>
                            <Boton variante="secundario" tamano="chico" onClick={() => setEditando(d.id)}>
                              Editar
                            </Boton>
                            <Boton
                              variante="secundario"
                              tamano="chico"
                              ocupado={ocupadoEn === `renovar-${d.id}`}
                              onClick={() => accion(d.id, "renovar")}
                            >
                              Renovar 30 días
                            </Boton>
                            <Boton
                              variante="peligro"
                              tamano="chico"
                              ocupado={ocupadoEn === `quitar-${d.id}`}
                              onClick={() => accion(d.id, "quitar")}
                            >
                              {confirmarQuitar === d.id ? "¿Seguro? Tocá de nuevo" : "Quitar"}
                            </Boton>
                          </>
                        )}
                      </Acciones>
                    </>
                  )}
                </Tarjeta>
              ))}
            </ul>
          )}
        </div>
      </Contenido>
    </>
  );
}

const CAMPOS = ["titulo", "descripcion", "categoria", "url", "sectorId", "version", "vigenteHasta"] as const;

function FormDocumento({
  documento,
  sectores,
  alGuardar,
  alCancelar,
}: {
  documento?: Documento;
  sectores: Sector[];
  alGuardar: () => void;
  alCancelar?: () => void;
}) {
  const avisar = useAvisos();
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS);
  const sufijo = documento ? `-${documento.id}` : "";

  return (
    <form
      noValidate
      aria-label={documento ? `Editar ${documento.titulo}` : "Agregar documento"}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const d = new FormData(form);
        const sector = texto(d, "sectorId");
        const vigencia = texto(d, "vigenteHasta");
        const r = await enviar(
          documentoSchema,
          {
            titulo: texto(d, "titulo"),
            descripcion: textoONull(d, "descripcion"),
            categoria: texto(d, "categoria"),
            url: texto(d, "url"),
            sectorId: sector ? Number(sector) : null,
            version: textoONull(d, "version"),
            vigenteHasta: vigencia ? finDelDia(vigencia) : null,
          },
          (v) => (documento ? api.biblioteca.actualizar(documento.id, v) : api.biblioteca.crear(v)),
        );
        if (r) {
          if (!documento) form.reset();
          avisar(documento ? "Documento actualizado" : "Documento publicado");
          alGuardar();
        }
      }}
    >
      <Mensaje tipo="error">{general}</Mensaje>
      <Campo nombre={`titulo${sufijo}`} etiqueta="Título" error={errores.titulo}>
        {(p) => <input {...p} name="titulo" defaultValue={documento?.titulo} maxLength={150} className={claseEntrada} />}
      </Campo>
      <Campo nombre={`descripcion${sufijo}`} etiqueta="Descripción" error={errores.descripcion}>
        {(p) => (
          <textarea {...p} name="descripcion" defaultValue={documento?.descripcion ?? ""} maxLength={500} className={`${claseTextarea} min-h-20`} />
        )}
      </Campo>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <Campo nombre={`categoria${sufijo}`} etiqueta="Categoría" error={errores.categoria}>
          {(p) => (
            <select {...p} name="categoria" defaultValue={documento?.categoria ?? "PROTOCOLO"} className={claseEntrada}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_DOCUMENTO[c]}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo nombre={`sectorId${sufijo}`} etiqueta="Sector" error={errores.sectorId}>
          {(p) => (
            <select {...p} name="sectorId" defaultValue={documento?.sector?.id ?? ""} className={claseEntrada}>
              <option value="">Todo el Centro</option>
              {sectores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>
      <Campo
        nombre={`url${sufijo}`}
        etiqueta="Enlace al documento"
        error={errores.url}
        ayuda="Tiene que empezar con https:// (por ahora no se suben archivos, se guarda el enlace)."
      >
        {(p) => (
          <input
            {...p}
            name="url"
            type="url"
            defaultValue={documento?.url}
            maxLength={500}
            placeholder="https://drive.google.com/..."
            className={claseEntrada}
          />
        )}
      </Campo>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <Campo nombre={`version${sufijo}`} etiqueta="Versión" error={errores.version}>
          {(p) => <input {...p} name="version" defaultValue={documento?.version ?? ""} maxLength={20} placeholder="v1" className={claseEntrada} />}
        </Campo>
        <Campo
          nombre={`vigenteHasta${sufijo}`}
          etiqueta="Vigente hasta"
          error={errores.vigenteHasta}
          ayuda="Vacío = 30 días. Máximo 180."
        >
          {(p) => (
            <input
              {...p}
              name="vigenteHasta"
              type="date"
              defaultValue={documento ? diaDe(documento.vigenteHasta) : ""}
              className={claseEntrada}
            />
          )}
        </Campo>
      </div>
      <div className="flex flex-wrap gap-2">
        <Boton type="submit" ocupado={ocupado}>
          {documento ? "Guardar cambios" : "Publicar documento"}
        </Boton>
        {alCancelar && (
          <Boton variante="secundario" onClick={alCancelar}>
            Cancelar
          </Boton>
        )}
      </div>
    </form>
  );
}
