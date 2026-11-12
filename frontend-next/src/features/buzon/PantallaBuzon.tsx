"use client";

import { useEffect, useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada, claseTextarea, GrupoOpciones, Opcion } from "@/components/ui/Campo";
import { Contenido, Encabezado } from "@/components/ui/Encabezado";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Plegable, Seccion } from "@/components/ui/Varios";
import { marcado, texto } from "@/features/comun/formularios";
import { useEnvio } from "@/features/comun/hooks";
import { api } from "@/lib/api";
import { mensajeAmigable } from "@/lib/api/errores";
import { fechaLarga } from "@/lib/fechas";
import type { MensajeBuzon } from "@/lib/tipos";
import { codigosGuardados, guardarCodigo } from "./codigos";
import { codigoSchema, mensajeBuzonSchema } from "./schema";
import { TarjetaMensaje } from "./TarjetaMensaje";

const CAMPOS = ["tipo", "asunto", "cuerpo", "anonimo"] as const;
const CAMPOS_CODIGO = ["codigo"] as const;

async function cargarMios(): Promise<MensajeBuzon[]> {
  const conNombre = await api.buzon.mios();
  // Los anónimos no están vinculados a tu usuario: se consultan con los códigos guardados en este dispositivo.
  const anonimos = await Promise.all(codigosGuardados().map((c) => api.buzon.seguimiento(c).catch(() => null)));
  const vistos = new Set(conNombre.map((m) => m.id));
  return conNombre
    .concat(anonimos.filter((m): m is MensajeBuzon => m !== null && !vistos.has(m.id)))
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

interface Props {
  codigoInicial: string | null;
  seguimientoInicial: MensajeBuzon | null;
  errorSeguimiento: string | null;
}

export function PantallaBuzon({ codigoInicial, seguimientoInicial, errorSeguimiento }: Props) {
  const [mios, setMios] = useState<MensajeBuzon[] | null>(null);
  const [errorMios, setErrorMios] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<MensajeBuzon | null>(null);
  const envio = useEnvio(CAMPOS);

  const recargar = () =>
    cargarMios()
      .then((m) => {
        setMios(m);
        setErrorMios(null);
      })
      .catch((e: unknown) => setErrorMios(mensajeAmigable(e)));

  useEffect(() => {
    // localStorage solo existe en el navegador: por eso "Mis mensajes" se carga acá.
    void recargar();
  }, []);

  return (
    <>
      <Encabezado titulo="Buzón" subtitulo="Consultas, sugerencias y reclamos. Te respondemos en 72 h." />
      <Contenido>
        <div role="status" aria-live="polite">
          {enviado && (
            <section className="mb-4 rounded-cc border-l-[6px] border-ok bg-ok-fondo p-4" aria-label="Mensaje enviado">
              <h2 className="text-xl font-bold">Enviado</h2>
              <p>Te respondemos antes del {fechaLarga(enviado.plazoRespuesta)}.</p>
              {enviado.anonimo && (
                <p className="mt-2">
                  Tu código de seguimiento es
                  <span
                    data-testid="codigo-seguimiento"
                    className="my-2 block w-fit rounded-[10px] bg-papel px-4 py-2 text-[32px] font-bold tracking-[0.12em]"
                  >
                    {enviado.codigoSeguimiento}
                  </span>
                  Anotalo: es la única forma de ver la respuesta desde otro dispositivo.
                </p>
              )}
            </section>
          )}
        </div>

        <form
          noValidate
          aria-label="Escribir al buzón"
          className="mb-4 rounded-cc bg-papel p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const d = new FormData(form);
            const m = await envio.enviar(
              mensajeBuzonSchema,
              { tipo: texto(d, "tipo"), asunto: texto(d, "asunto"), cuerpo: texto(d, "cuerpo"), anonimo: marcado(d, "anonimo") },
              (v) => api.buzon.enviar(v),
            );
            if (m) {
              if (m.anonimo) guardarCodigo(m.codigoSeguimiento);
              setEnviado(m);
              form.reset();
              window.scrollTo({ top: 0 });
              void recargar();
            }
          }}
        >
          <Mensaje tipo="error">{envio.general}</Mensaje>
          <GrupoOpciones nombre="tipo" leyenda="¿Qué querés enviar?" error={envio.errores.tipo}>
            <Opcion>
              <input type="radio" name="tipo" value="CONSULTA" defaultChecked /> Consulta
            </Opcion>
            <Opcion>
              <input type="radio" name="tipo" value="SUGERENCIA" /> Sugerencia
            </Opcion>
            <Opcion>
              <input type="radio" name="tipo" value="RECLAMO" /> Reclamo
            </Opcion>
          </GrupoOpciones>
          <Campo nombre="asunto" etiqueta="Asunto" error={envio.errores.asunto}>
            {(p) => <input {...p} maxLength={150} className={claseEntrada} />}
          </Campo>
          <Campo nombre="cuerpo" etiqueta="Mensaje" error={envio.errores.cuerpo}>
            {(p) => <textarea {...p} maxLength={4000} className={claseTextarea} />}
          </Campo>
          <div className="mb-4">
            <Opcion>
              <input type="checkbox" name="anonimo" /> Enviar sin mi nombre (anónimo)
            </Opcion>
            <p className="mt-1 text-[15px] text-tinta-suave">
              Si es anónimo no se guarda quién lo mandó. Vas a recibir un código para ver la respuesta.
            </p>
          </div>
          <Boton type="submit" ancho ocupado={envio.ocupado}>
            Enviar
          </Boton>
        </form>

        <Seccion titulo="Mis mensajes" id="t-mios">
          <Mensaje tipo="error">{errorMios}</Mensaje>
          {mios === null ? (
            !errorMios && <Cargando />
          ) : mios.length === 0 ? (
            <Vacio>Todavía no enviaste mensajes.</Vacio>
          ) : (
            <ul aria-live="polite">
              {mios.map((m) => (
                <TarjetaMensaje key={m.id} m={m} />
              ))}
            </ul>
          )}
        </Seccion>

        <BuscarCodigo codigoInicial={codigoInicial} inicial={seguimientoInicial} errorInicial={errorSeguimiento} />
      </Contenido>
    </>
  );
}

function BuscarCodigo({
  codigoInicial,
  inicial,
  errorInicial,
}: {
  codigoInicial: string | null;
  inicial: MensajeBuzon | null;
  errorInicial: string | null;
}) {
  const [abierto, setAbierto] = useState(codigoInicial !== null);
  const [resultado, setResultado] = useState<MensajeBuzon | null>(inicial);
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS_CODIGO);

  async function buscar(codigo: string) {
    setResultado(null);
    const m = await enviar(codigoSchema, { codigo }, (v) => api.buzon.seguimiento(v.codigo));
    if (m) setResultado(m);
  }

  return (
    <Plegable titulo="Tengo un código de seguimiento" abierto={abierto} alCambiar={setAbierto}>
      <form
        noValidate
        aria-label="Buscar por código"
        onSubmit={(e) => {
          e.preventDefault();
          void buscar(texto(new FormData(e.currentTarget), "codigo"));
        }}
      >
        <Mensaje tipo="error">{general ?? (resultado ? null : errorInicial)}</Mensaje>
        <Campo nombre="codigo" etiqueta="Código" error={errores.codigo}>
          {(p) => <input {...p} defaultValue={codigoInicial ?? ""} autoComplete="off" className={`${claseEntrada} uppercase`} />}
        </Campo>
        <Boton type="submit" ocupado={ocupado}>
          Buscar
        </Boton>
      </form>
      {resultado && (
        <ul className="mt-3.5" aria-live="polite">
          <TarjetaMensaje m={resultado} />
        </ul>
      )}
    </Plegable>
  );
}
