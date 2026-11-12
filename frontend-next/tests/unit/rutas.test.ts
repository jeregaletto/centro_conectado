import { describe, expect, it } from "vitest";

import { rutaDeLink } from "@/lib/notificaciones";
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

describe("rutaDeLink (links de notificaciones)", () => {
  it("acepta las rutas que manda el backend", () => {
    expect(rutaDeLink("/pedidos/12")).toBe("/pedidos/12");
    expect(rutaDeLink("/inicio?aviso=3")).toBe("/inicio?aviso=3");
    expect(rutaDeLink("/gestion?seccion=buzon")).toBe("/gestion?seccion=buzon");
    expect(rutaDeLink("/buzon?codigo=AB12CD34EF")).toBe("/buzon?codigo=AB12CD34EF");
    expect(rutaDeLink("/publicar?tipo=publicados")).toBe("/publicar?tipo=publicados");
  });

  it("descarta lo que no es una ruta propia", () => {
    expect(rutaDeLink("https://otro.sitio/x")).toBeNull();
    expect(rutaDeLink("//otro.sitio")).toBeNull();
    expect(rutaDeLink("pedidos.html?id=3")).toBeNull();
    expect(rutaDeLink("/login")).toBeNull();
    expect(rutaDeLink(null)).toBeNull();
    expect(rutaDeLink("")).toBeNull();
  });
});
