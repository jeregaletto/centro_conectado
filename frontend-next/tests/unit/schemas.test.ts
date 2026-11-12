import { describe, expect, it } from "vitest";

import { documentoSchema } from "@/features/biblioteca/schema";
import { mensajeBuzonSchema } from "@/features/buzon/schema";
import { erroresDeZod, repartirCampos } from "@/features/comun/formularios";
import { crearUsuarioSchema } from "@/features/gestion/schema";
import { cambiarPasswordSchema, loginSchema } from "@/features/login/schema";
import { accionPedidoSchema, crearPedidoSchema } from "@/features/pedidos/schema";
import { avisoSchema, eventoSchema, MENSAJE_SOLO_TU_SECTOR } from "@/features/publicar/schema";

const errores = (r: { success: boolean; error?: import("zod").ZodError }) => (r.error ? erroresDeZod(r.error) : {});

describe("mensajes iguales al backend", () => {
  it("login (LoginRequest)", () => {
    expect(errores(loginSchema.safeParse({ usuario: "  ", password: "" }))).toEqual({
      usuario: "Ingresá tu DNI o usuario",
      password: "Ingresá tu contraseña",
    });
  });

  it("cambiar contraseña (CambiarPasswordRequest)", () => {
    expect(errores(cambiarPasswordSchema.safeParse({ actual: "x", nueva: "corta" }))).toEqual({
      nueva: "La nueva contraseña debe tener entre 8 y 100 caracteres",
    });
  });

  it("pedido: vacíos y nulos como Hibernate Validator", () => {
    expect(errores(crearPedidoSchema.safeParse({ tipo: "PEDIDO", asunto: "", detalle: " " }))).toEqual({
      sectorDestinoId: "no debe ser nulo",
      asunto: "no debe estar vacío",
      detalle: "no debe estar vacío",
    });
    expect(errores(crearPedidoSchema.safeParse({ tipo: "PEDIDO", sectorDestinoId: 2, asunto: "x".repeat(151), detalle: "d" }))).toEqual({
      asunto: "el tamaño debe estar entre 0 y 150",
    });
  });

  it("buzón y biblioteca", () => {
    expect(errores(mensajeBuzonSchema.safeParse({ tipo: "RECLAMO", asunto: "", cuerpo: "c", anonimo: true }))).toEqual({
      asunto: "no debe estar vacío",
    });
    const doc = { titulo: "t", descripcion: null, categoria: "PROTOCOLO", sectorId: null, version: null, vigenteHasta: null };
    expect(errores(documentoSchema.safeParse({ ...doc, url: "http://inseguro.com/a.pdf" }))).toEqual({
      url: "La URL tiene que empezar con https:// o /",
    });
    expect(documentoSchema.safeParse({ ...doc, url: "/docs/a.pdf" }).success).toBe(true);
  });

  it("usuario nuevo: contraseña inicial de 8 a 100", () => {
    const r = crearUsuarioSchema.safeParse({
      usuario: "nuevo",
      nombre: "A",
      apellido: "B",
      email: null,
      telefono: null,
      interno: null,
      puesto: "P",
      rol: "PROFESIONAL",
      sectorId: 1,
      passwordInicial: "1234",
    });
    expect(errores(r)).toEqual({ passwordInicial: "el tamaño debe estar entre 8 y 100" });
  });
});

describe("reglas de dominio", () => {
  it("rechazar un pedido exige motivo", () => {
    expect(errores(accionPedidoSchema.safeParse({ accion: "RECHAZADO", comentario: "  " }))).toEqual({
      comentario: "Para rechazar escribí el motivo",
    });
    expect(accionPedidoSchema.safeParse({ accion: "RECHAZADO", comentario: "Sin stock" }).success).toBe(true);
    expect(accionPedidoSchema.safeParse({ accion: "RESUELTO", comentario: "" }).success).toBe(true);
  });

  const aviso = { titulo: "t", cuerpo: "c", tipo: "NOVEDAD", fijado: false, requiereLectura: true, vigenteHasta: null };
  const ENFERMERIA = 4;
  const KINESIOLOGIA = 5;

  it("el referente solo publica para su sector (campo sectorIds)", () => {
    const referente = avisoSchema({ general: false, sectorPropio: ENFERMERIA });
    expect(referente.safeParse({ ...aviso, sectorIds: [ENFERMERIA] }).success).toBe(true);
    expect(referente.safeParse({ ...aviso, sectorIds: [] }).success).toBe(true);
    expect(errores(referente.safeParse({ ...aviso, sectorIds: [KINESIOLOGIA] }))).toEqual({ sectorIds: MENSAJE_SOLO_TU_SECTOR });
  });

  it("Dirección publica para cualquier sector o todo el Centro", () => {
    const direccion = avisoSchema({ general: true, sectorPropio: 1 });
    expect(direccion.safeParse({ ...aviso, sectorIds: [KINESIOLOGIA, ENFERMERIA] }).success).toBe(true);
    expect(direccion.safeParse({ ...aviso, sectorIds: [] }).success).toBe(true);
  });

  it("un evento termina después de empezar", () => {
    const base = { titulo: "t", descripcion: null, tipo: "REUNION", lugar: null, recordatorioMinutos: 60, sectorIds: [] };
    const s = eventoSchema({ general: true, sectorPropio: 1 });
    expect(errores(s.safeParse({ ...base, inicio: "2026-11-14T10:00", fin: "2026-11-14T09:00" }))).toEqual({
      fin: "El evento tiene que terminar después de empezar",
    });
    expect(s.safeParse({ ...base, inicio: "2026-11-14T10:00", fin: "2026-11-14T11:00" }).success).toBe(true);
  });
});

describe("repartirCampos", () => {
  it("lo que no tiene input va al mensaje general", () => {
    expect(repartirCampos({ asunto: "a", plazo: "p" }, ["asunto"])).toEqual({ porCampo: { asunto: "a" }, sueltos: ["p"] });
  });
});
