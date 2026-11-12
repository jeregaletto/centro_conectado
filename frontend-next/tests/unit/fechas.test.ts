import { describe, expect, it } from "vitest";

import {
  aInputFechaHora,
  diaDe,
  fecha,
  fechaHora,
  fechaLarga,
  finDelDia,
  hora,
  hoy,
  saludo,
  sumarDias,
  sumarMinutos,
} from "@/lib/fechas";

describe("fechas", () => {
  it("corre con la zona de Buenos Aires (donde aparecía el bug)", () => {
    expect(new Date(Date.UTC(2026, 10, 12, 3)).getHours()).toBe(0);
  });

  it("una fecha sin hora es ese día local, no el anterior (bug de la versión HTML)", () => {
    expect(fecha("2026-11-12")).toBe("12 nov");
    expect(fechaLarga("2026-11-12")).toBe("jueves, 12 de noviembre");
    expect(fecha("2026-01-01")).toBe("1 ene");
  });

  it("muestra la hora del backend tal cual, sin convertir de zona", () => {
    expect(hora("2026-11-12T14:00:00")).toBe("14:00");
    expect(hora("2026-11-12T00:05:00")).toBe("00:05");
    expect(fecha("2026-11-12T23:59:00")).toBe("12 nov");
    expect(fechaHora("2026-11-12T09:30:00")).toBe("12 nov, 09:30");
  });

  it("acepta fracciones de segundo y fechas sin segundos", () => {
    expect(hora("2026-11-12T18:52:20.7037187")).toBe("18:52");
    expect(hora("2026-11-14T10:00")).toBe("10:00");
  });

  it("un Instant con Z se muestra en hora de Buenos Aires", () => {
    expect(hora("2026-11-13T09:00:00Z")).toBe("06:00");
    expect(fecha("2026-11-13T02:00:00Z")).toBe("12 nov");
  });

  it("hoy() es el día de Buenos Aires aunque en UTC ya sea mañana", () => {
    expect(hoy(new Date("2026-11-13T02:30:00Z"))).toBe("2026-11-12");
    expect(hoy(new Date("2026-11-13T03:30:00Z"))).toBe("2026-11-13");
  });

  it("suma días cruzando meses y años", () => {
    expect(sumarDias("2026-11-28", 6)).toBe("2026-12-04");
    expect(sumarDias("2026-12-30", 3)).toBe("2027-01-02");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("convierte para inputs y vigencias", () => {
    expect(diaDe("2026-11-12T14:00:00")).toBe("2026-11-12");
    expect(aInputFechaHora("2026-11-12T14:05:33")).toBe("2026-11-12T14:05");
    expect(finDelDia("2026-11-20")).toBe("2026-11-20T23:59:00");
    expect(sumarMinutos("2026-11-12T23:30", 60)).toBe("2026-11-13T00:30");
  });

  it("rechaza fechas inválidas", () => {
    expect(() => fecha("12/11/2026")).toThrow();
  });

  it("saluda según la hora de Buenos Aires", () => {
    expect(saludo(new Date("2026-11-12T12:00:00Z"))).toBe("Buen día"); // 9:00 BA
    expect(saludo(new Date("2026-11-12T18:00:00Z"))).toBe("Buenas tardes"); // 15:00 BA
    expect(saludo(new Date("2026-11-13T00:30:00Z"))).toBe("Buenas noches"); // 21:30 BA
  });
});
