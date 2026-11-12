"use client";

import { useState } from "react";

import { Boton } from "@/components/ui/Boton";
import { Campo, claseEntrada, claseTextarea } from "@/components/ui/Campo";
import { Cargando, Mensaje, Vacio } from "@/components/ui/Mensaje";
import { Acciones } from "@/components/ui/Tarjeta";
import { useAvisos } from "@/components/ui/Toast";
import { texto } from "@/features/comun/formularios";
import { useAccion, useConsulta, useEnvio } from "@/features/comun/hooks";
import { respuestaSchema } from "@/features/buzon/schema";
import { TarjetaMensaje } from "@/features/buzon/TarjetaMensaje";
import { api } from "@/lib/api";
import { ESTADO_MENSAJE } from "@/lib/etiquetas";
import type { EstadoMensaje, MensajeBuzon } from "@/lib/tipos";

export function SeccionBuzon() {
  const [estado, setEstado] = useState<EstadoMensaje | "">("RECIBIDO");
  const { datos, error, cargando, setDatos } = useConsulta(`buzon|${estado}`, () => api.buzon.gestion(estado || undefined));

  const reemplazar = (m: MensajeBuzon) => datos && setDatos(datos.map((x) => (x.id === m.id ? m : x)));

  return (
    <>
      <Campo nombre="buzon-estado" etiqueta="Estado" etiquetaOculta>
        {(p) => (
          <select {...p} value={estado} onChange={(e) => setEstado(e.target.value as EstadoMensaje | "")} className={claseEntrada}>
            <option value="">Todos</option>
            <option value="RECIBIDO">Recibidos (sin responder)</option>
            <option value="EN_REVISION">{ESTADO_MENSAJE.EN_REVISION}</option>
            <option value="RESPONDIDO">Respondidos</option>
            <option value="CERRADO">Cerrados</option>
          </select>
        )}
      </Campo>
      <Mensaje tipo="error">{error}</Mensaje>
      {cargando ? (
        <Cargando />
      ) : !datos || datos.length === 0 ? (
        !error && <Vacio>No hay mensajes en este estado.</Vacio>
      ) : (
        <ul aria-live="polite">
          {datos.map((m) => (
            <MensajeGestion key={m.id} m={m} alCambiar={reemplazar} />
          ))}
        </ul>
      )}
    </>
  );
}

const CAMPOS = ["respuesta"] as const;

function MensajeGestion({ m, alCambiar }: { m: MensajeBuzon; alCambiar: (m: MensajeBuzon) => void }) {
  const avisar = useAvisos();
  const { errores, general, ocupado, enviar } = useEnvio(CAMPOS);
  const { ocupadoEn, correr } = useAccion();
  const abierto = m.estado === "RECIBIDO" || m.estado === "EN_REVISION";

  async function estado(nuevo: EstadoMensaje) {
    const r = await correr(nuevo, () => api.buzon.cambiarEstado(m.id, nuevo));
    if (r.ok) alCambiar(r.valor);
    else avisar(r.error, "error");
  }

  return (
    <TarjetaMensaje m={m} gestion>
      {abierto ? (
        <form
          noValidate
          aria-label={`Responder: ${m.asunto}`}
          className="mt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await enviar(respuestaSchema, { respuesta: texto(new FormData(e.currentTarget), "respuesta") }, (v) =>
              api.buzon.responder(m.id, v.respuesta),
            );
            if (r) {
              avisar("Respuesta enviada");
              alCambiar(r);
            }
          }}
        >
          <Mensaje tipo="error">{general}</Mensaje>
          <Campo nombre={`respuesta-${m.id}`} etiqueta="Respuesta" error={errores.respuesta} etiquetaOculta>
            {(p) => <textarea {...p} name="respuesta" maxLength={4000} placeholder="Escribí la respuesta" className={claseTextarea} />}
          </Campo>
          <div className="flex flex-wrap gap-2">
            <Boton type="submit" tamano="chico" ocupado={ocupado}>
              Responder
            </Boton>
            {m.estado === "RECIBIDO" && (
              <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === "EN_REVISION"} onClick={() => estado("EN_REVISION")}>
                Marcar en revisión
              </Boton>
            )}
            <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === "CERRADO"} onClick={() => estado("CERRADO")}>
              Cerrar sin responder
            </Boton>
          </div>
        </form>
      ) : (
        m.estado === "RESPONDIDO" && (
          <Acciones>
            <Boton variante="secundario" tamano="chico" ocupado={ocupadoEn === "CERRADO"} onClick={() => estado("CERRADO")}>
              Cerrar
            </Boton>
          </Acciones>
        )
      )}
    </TarjetaMensaje>
  );
}
