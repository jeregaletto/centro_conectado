"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";

import { esApiError, mensajeAmigable } from "@/lib/api/errores";
import { erroresDeZod, repartirCampos } from "./formularios";

const MENSAJE_REVISAR = "Revisá los datos marcados.";

/**
 * Envío de un formulario: valida con Zod, llama a la API y reparte los errores.
 * - Error de un campo (Zod o `campos` del backend) → debajo de ese campo.
 * - Si no hay campo → un mensaje arriba del formulario.
 */
export function useEnvio(camposConocidos: readonly string[]) {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const enCurso = useRef(false);

  const aplicarCampos = useCallback(
    (campos: Record<string, string>, mensajeSiNoHayCampo: string) => {
      const { porCampo, sueltos } = repartirCampos(campos, camposConocidos);
      setErrores(porCampo);
      setGeneral(sueltos.length > 0 ? sueltos.join(". ") : Object.keys(porCampo).length > 0 ? null : mensajeSiNoHayCampo);
    },
    [camposConocidos],
  );

  const enviar = useCallback(
    async <S extends z.ZodType, R>(
      schema: S,
      valores: unknown,
      accion: (datos: z.output<S>) => Promise<R>,
    ): Promise<R | undefined> => {
      if (enCurso.current) return undefined; // nunca doble envío
      const validado = schema.safeParse(valores);
      if (!validado.success) {
        aplicarCampos(erroresDeZod(validado.error), MENSAJE_REVISAR);
        return undefined;
      }
      setErrores({});
      setGeneral(null);
      enCurso.current = true;
      setOcupado(true);
      try {
        return await accion(validado.data);
      } catch (e) {
        if (esApiError(e) && e.campos) aplicarCampos(e.campos, mensajeAmigable(e));
        else setGeneral(mensajeAmigable(e));
        return undefined;
      } finally {
        enCurso.current = false;
        setOcupado(false);
      }
    },
    [aplicarCampos],
  );

  const limpiar = useCallback(() => {
    setErrores({});
    setGeneral(null);
  }, []);

  return { errores, general, ocupado, enviar, limpiar, setGeneral };
}

export interface EstadoConsulta<T> {
  datos: T | undefined;
  error: string | null;
  cargando: boolean;
  recargar: () => void;
  setDatos: (d: T) => void;
}

/**
 * Lectura desde un Client Component (pasa por el proxy). Vuelve a pedir cuando cambia `clave`.
 * `inicial` son los datos que ya trajo el Server Component para la clave inicial (no se vuelven a pedir).
 * Respuestas viejas que llegan tarde se descartan.
 */
export function useConsulta<T>(clave: string, consulta: () => Promise<T>, inicial?: T): EstadoConsulta<T> {
  const [estado, setEstado] = useState<{ clave: string; datos: T | undefined; error: string | null }>({
    clave: inicial !== undefined ? clave : "",
    datos: inicial,
    error: null,
  });
  const [version, setVersion] = useState(0);
  const consultaRef = useRef(consulta);
  useEffect(() => {
    consultaRef.current = consulta;
  });
  const primera = useRef(inicial !== undefined);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    let vigente = true;
    consultaRef
      .current()
      .then((datos) => vigente && setEstado({ clave, datos, error: null }))
      .catch((e: unknown) => vigente && setEstado((s) => ({ clave, datos: s.datos, error: mensajeAmigable(e) })));
    return () => {
      vigente = false;
    };
  }, [clave, version]);

  return {
    datos: estado.datos,
    error: estado.error,
    cargando: estado.clave !== clave,
    recargar: useCallback(() => setVersion((v) => v + 1), []),
    setDatos: useCallback((d: T) => setEstado((s) => ({ ...s, datos: d, error: null })), []),
  };
}

/** Acción de un botón suelto (no formulario): evita doble toque y devuelve el error amigable. */
export function useAccion() {
  const [ocupadoEn, setOcupadoEn] = useState<string | null>(null);
  const correr = useCallback(async <R,>(id: string, accion: () => Promise<R>): Promise<{ ok: true; valor: R } | { ok: false; error: string }> => {
    setOcupadoEn(id);
    try {
      return { ok: true, valor: await accion() };
    } catch (e) {
      return { ok: false, error: mensajeAmigable(e) };
    } finally {
      setOcupadoEn(null);
    }
  }, []);
  return { ocupadoEn, correr };
}

/** Valor con retardo (para buscar mientras se escribe). */
export function useRetardo<T>(valor: T, ms = 300): T {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}
