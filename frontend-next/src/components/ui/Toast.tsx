"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Tono = "ok" | "error";
type Avisar = (texto: string, tono?: Tono) => void;

const AvisosContext = createContext<Avisar>(() => {});

/** Mensaje breve flotante (aria-live), en lugar de alert(). */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<{ texto: string; tono: Tono } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback<Avisar>((texto, tono = "ok") => {
    setAviso({ texto, tono });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAviso(null), 4000);
  }, []);

  return (
    <AvisosContext value={avisar}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 simple:bottom-28"
      >
        {aviso && (
          <p
            className={`max-w-xl rounded-cc px-4 py-3 font-bold text-papel shadow-lg ${aviso.tono === "error" ? "bg-error" : "bg-tinta"}`}
          >
            {aviso.texto}
          </p>
        )}
      </div>
    </AvisosContext>
  );
}

export function useAvisos(): Avisar {
  return useContext(AvisosContext);
}
