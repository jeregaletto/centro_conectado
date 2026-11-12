import { describe, expect, it } from "vitest";

import { esDelAviso, rutaDeLink } from "@/lib/notificaciones";
import { rutaSegura } from "@/lib/rutas";

describe("rutaSegura (parámetro volver)", () => {
  it("acepta rutas propias", () => {
    expect(rutaSegura("/pedidos/3")).toBe("/pedidos/3");
    expect(rutaSegura("/agenda?evento=4")).toBe("/agenda?evento=4");
    expect(rutaSegura("/buzon?codigo=AB12CD34EF#x")).toBe("/buzon?codigo=AB12CD34EF#x");
  });

  it.each([
    null,
    undefined,
    "",
    "pedidos",
    "//sitio-malo.com",
    "/\\sitio-malo.com",
    "https://sitio-malo.com",
    "javascript:alert(1)",
    "/%0d%0aSet-Cookie",
    "/%5csitio-malo.com",
    "/%2f%2fsitio-malo.com",
    "/ruta con espacios",
    "/login",
    "/login?volver=/inicio",
    "/api/session",
  ])("rechaza %s y va a /inicio", (volver) => {
    expect(rutaSegura(volver)).toBe("/inicio");
  });

  it("normaliza puntos sin salir del sitio", () => {
    expect(rutaSegura("/a/../inicio")).toBe("/inicio");
  });
});

describe("rutaDeLink (links de notificaciones del backend)", () => {
  it("traduce las rutas de las maquetas viejas", () => {
    expect(rutaDeLink("pedidos.html?id=12")).toBe("/pedidos/12");
    expect(rutaDeLink("inicio.html?aviso=3")).toBe("/inicio?aviso=3");
    expect(rutaDeLink("inicio.html?resumen=1")).toBe("/inicio");
    expect(rutaDeLink("agenda.html?evento=4")).toBe("/agenda?evento=4");
    expect(rutaDeLink("buzon.html?gestion=7")).toBe("/gestion?seccion=buzon");
    expect(rutaDeLink("buzon.html?gestion=vencidos")).toBe("/gestion?seccion=buzon");
    expect(rutaDeLink("buzon.html?codigo=AB12CD34EF")).toBe("/buzon?codigo=AB12CD34EF");
    expect(rutaDeLink("biblioteca.html?id=5")).toBe("/biblioteca?id=5");
  });

  it("acepta rutas nuevas y descarta lo raro", () => {
    expect(rutaDeLink("/pedidos/3")).toBe("/pedidos/3");
    expect(rutaDeLink("https://otro.sitio/x.html")).toBeNull();
    expect(rutaDeLink("//otro.sitio")).toBeNull();
    expect(rutaDeLink("desconocida.html")).toBeNull();
    expect(rutaDeLink("pedidos.html?id=1;DROP")).toBe("/pedidos");
    expect(rutaDeLink(null)).toBeNull();
  });

  it("reconoce la notificación de un aviso", () => {
    expect(esDelAviso("inicio.html?aviso=9", 9)).toBe(true);
    expect(esDelAviso("inicio.html?aviso=19", 9)).toBe(false);
  });
});
