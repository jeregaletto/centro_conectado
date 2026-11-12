import type { ReactNode } from "react";

/** Clases de inputs, selects y textareas. */
export const claseEntrada =
  "block w-full min-h-toque rounded-[10px] border-2 border-borde bg-papel px-3 py-2.5 text-tinta " +
  "aria-invalid:border-error simple:text-xl";

export const claseTextarea = `${claseEntrada} min-h-28 resize-y`;

export interface PropsEntrada {
  id: string;
  name: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

interface PropsCampo {
  /** name del campo: es la clave de `campos` que devuelve el backend. */
  nombre: string;
  etiqueta: ReactNode;
  error?: string;
  ayuda?: ReactNode;
  /** Ocultar la etiqueta visualmente (sigue para lectores de pantalla). */
  etiquetaOculta?: boolean;
  className?: string;
  /** Recibe id, name y los aria para conectar el input con su etiqueta, ayuda y error. */
  children: (entrada: PropsEntrada) => ReactNode;
}

export function Campo({ nombre, etiqueta, error, ayuda, etiquetaOculta, className = "", children }: PropsCampo) {
  const id = `campo-${nombre}`;
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const describedby = [idAyuda, idError].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className={etiquetaOculta ? "sr-only" : "mb-1.5 block font-bold"}>
        {etiqueta}
      </label>
      {children({ id, name: nombre, "aria-invalid": error ? true : undefined, "aria-describedby": describedby })}
      {ayuda && (
        <p id={idAyuda} className="mt-1 text-[15px] text-tinta-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1 text-[15px] font-bold text-error">
          {error}
        </p>
      )}
    </div>
  );
}

interface PropsGrupo {
  nombre: string;
  leyenda: ReactNode;
  error?: string;
  ayuda?: ReactNode;
  children: ReactNode;
}

/** Grupo de radios o checkboxes con leyenda y error propio (ej: "¿Para quién?"). */
export function GrupoOpciones({ nombre, leyenda, error, ayuda, children }: PropsGrupo) {
  const idError = error ? `grupo-${nombre}-error` : undefined;
  return (
    <fieldset className="mb-4" aria-describedby={idError} aria-invalid={error ? true : undefined}>
      <legend className="mb-1.5 font-bold">{leyenda}</legend>
      {ayuda && <p className="mb-2 text-[15px] text-tinta-suave">{ayuda}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
      {error && (
        <p id={idError} className="mt-1 text-[15px] font-bold text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Etiqueta clickeable para un radio o checkbox, con borde marcado cuando está elegido. */
export function Opcion({ children }: { children: ReactNode }) {
  return (
    <label
      className={
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border-2 border-borde bg-papel px-3.5 " +
        "has-checked:border-tinta has-checked:bg-pared has-checked:font-bold has-disabled:cursor-default simple:min-h-14 " +
        "[&_input]:size-5 [&_input]:accent-tinta"
      }
    >
      {children}
    </label>
  );
}
