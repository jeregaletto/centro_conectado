import { describe, expect, it } from "vitest";

import {
  destinoInicial,
  menuMas,
  menuPara,
  pestanaActiva,
  puedeGestionar,
  puedePublicar,
  seccionesGestion,
  tiene,
} from "@/lib/permisos";
import type { Permiso, Vista } from "@/lib/tipos";

/** Espejo de Rol.java del backend. */
const TODOS: Permiso[] = [
  "PUBLICAR_GENERAL",
  "PUBLICAR_SECTOR",
  "VER_LECTURAS",
  "GESTIONAR_TAREAS_GENERAL",
  "GESTIONAR_TAREAS_SECTOR",
  "GESTIONAR_BUZON",
  "GESTIONAR_BIBLIOTECA",
  "GESTIONAR_USUARIOS",
  "VER_TODOS_LOS_PEDIDOS",
];
const u = (vista: Vista, permisos: Permiso[]) => ({ vista, permisos, debeCambiarPassword: false });

const direccion = u("COMPLETA", TODOS);
const referente = u("COMPLETA", ["PUBLICAR_SECTOR", "GESTIONAR_TAREAS_SECTOR", "VER_LECTURAS"]);
const profesional = u("COMPLETA", []);
const maestranza = u("SIMPLE", []);

describe("permisos", () => {
  it("tiene() con usuario nulo o sin permisos", () => {
    expect(tiene(null, "PUBLICAR_GENERAL")).toBe(false);
    expect(tiene(profesional, "PUBLICAR_GENERAL")).toBe(false);
    expect(tiene(direccion, "GESTIONAR_USUARIOS")).toBe(true);
  });

  it("maestranza ve 4 botones: Inicio, Mi puesto, Pedidos, Buzón", () => {
    expect(menuPara(maestranza)).toEqual(["inicio", "miPuesto", "pedidos", "buzon"]);
  });

  it("el resto ve Inicio, Agenda, Pedidos, Buzón y Más", () => {
    for (const x of [direccion, referente, profesional]) {
      expect(menuPara(x)).toEqual(["inicio", "agenda", "pedidos", "buzon", "mas"]);
    }
    expect(menuPara(null)).toEqual([]);
  });

  it("Más según permisos", () => {
    expect(menuMas(profesional)).toEqual(["miPuesto", "quien", "biblioteca"]);
    expect(menuMas(referente)).toEqual(["gestion", "publicar", "miPuesto", "quien", "biblioteca"]);
    expect(menuMas(direccion)).toEqual(["gestion", "publicar", "miPuesto", "quien", "biblioteca"]);
  });

  it("publicar y gestionar", () => {
    expect(puedePublicar(referente)).toBe(true);
    expect(puedePublicar(maestranza)).toBe(false);
    expect(puedeGestionar(profesional)).toBe(false);
  });

  it("pestañas de Gestión por permiso", () => {
    expect(seccionesGestion(direccion)).toEqual(["buzon", "tareas", "pedidos", "usuarios"]);
    expect(seccionesGestion(referente)).toEqual(["tareas"]);
    expect(seccionesGestion(maestranza)).toEqual([]);
  });

  it("pestaña activa de la barra", () => {
    expect(pestanaActiva("/inicio", direccion)).toBe("inicio");
    expect(pestanaActiva("/pedidos/12", direccion)).toBe("pedidos");
    expect(pestanaActiva("/biblioteca", direccion)).toBe("mas");
    expect(pestanaActiva("/mi-puesto", direccion)).toBe("mas");
    expect(pestanaActiva("/mi-puesto", maestranza)).toBe("miPuesto");
    expect(pestanaActiva("/notificaciones", direccion)).toBeNull();
    expect(pestanaActiva("/quien-es-quien", maestranza)).toBeNull();
  });

  it("destino al entrar", () => {
    expect(destinoInicial({ debeCambiarPassword: false })).toBe("/inicio");
    expect(destinoInicial({ debeCambiarPassword: true })).toBe("/login?cambiar=1");
  });
});
