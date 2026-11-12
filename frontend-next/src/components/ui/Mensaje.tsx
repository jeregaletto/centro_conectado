import type { ReactNode } from "react";

type TipoMensaje = "error" | "ok" | "info";

const ESTILOS: Record<TipoMensaje, string> = {
  error: "bg-error-fondo border-error text-[#5c1216]",
  ok: "bg-ok-fondo border-ok text-tinta",
  info: "bg-[#fff7d6] border-senal text-tinta",
};

interface PropsMensaje {
  tipo?: TipoMensaje;
  children?: ReactNode;
  className?: string;
}

/**
 * Mensaje en pantalla (nunca alert()). Los errores se anuncian enseguida (role="alert"),
 * el resto con aria-live="polite". El contenedor existe siempre para que el lector lo escuche al cambiar.
 */
export function Mensaje({ tipo = "error", children, className = "" }: PropsMensaje) {
  const vacio = children === null || children === undefined || children === false || children === "";
  return (
    <div role={tipo === "error" ? "alert" : "status"} aria-live={tipo === "error" ? "assertive" : "polite"}>
      {!vacio && (
        <div className={`my-3 rounded-[10px] border-l-[6px] px-3.5 py-3 font-bold ${ESTILOS[tipo]} ${className}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2.5 rounded-cc border-2 border-dashed border-borde bg-papel p-4 text-tinta-suave">{children}</p>
  );
}

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <p role="status" aria-live="polite" className="py-3 text-tinta-suave">
      {texto}
    </p>
  );
}
