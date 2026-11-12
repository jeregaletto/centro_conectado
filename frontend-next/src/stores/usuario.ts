"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";

import type { UsuarioActual } from "@/lib/tipos";

/**
 * Estado de cliente de la sesión: usuario actual y notificaciones sin leer.
 * Los datos del servidor (avisos, pedidos...) NO van acá: se piden en cada pantalla.
 *
 * Un store por instancia del proveedor (no un singleton de módulo): en el servidor de Next un store
 * global se compartiría entre pedidos de personas distintas.
 */
export interface EstadoSesion {
  usuario: UsuarioActual;
  /** null = todavía no se consultó. */
  noLeidas: number | null;
  setUsuario: (u: UsuarioActual) => void;
  setNoLeidas: (n: number) => void;
  /** Baja el contador en `n` sin ir al servidor (al marcar algo como leído). */
  descontar: (n?: number) => void;
}

export function crearStoreSesion(usuario: UsuarioActual): StoreApi<EstadoSesion> {
  return createStore<EstadoSesion>()((set) => ({
    usuario,
    noLeidas: null,
    setUsuario: (u) => set({ usuario: u }),
    setNoLeidas: (n) => set({ noLeidas: Math.max(0, n) }),
    descontar: (n = 1) => set((s) => ({ noLeidas: s.noLeidas === null ? null : Math.max(0, s.noLeidas - n) })),
  }));
}

export const StoreSesionContext = createContext<StoreApi<EstadoSesion> | null>(null);

export function useSesion<T>(selector: (s: EstadoSesion) => T): T {
  const store = useContext(StoreSesionContext);
  if (!store) throw new Error("useSesion se usa dentro de <ProveedorSesion>");
  return useStore(store, selector);
}

/** Atajo: el usuario de la sesión. */
export function useUsuario(): UsuarioActual {
  return useSesion((s) => s.usuario);
}
