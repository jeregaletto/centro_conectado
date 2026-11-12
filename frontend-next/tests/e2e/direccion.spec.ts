import { expect, test } from "@playwright/test";

import { badge, borrarAvisos, capturar, contadorBackend, ingresar, pantallaSinErrores, unico } from "./ayudas";

const RUTAS = [
  "/inicio",
  "/agenda",
  "/mi-puesto",
  "/pedidos",
  "/buzon",
  "/quien-es-quien",
  "/biblioteca",
  "/publicar",
  "/gestion",
  "/mas",
  "/notificaciones",
] as const;

test.describe("direccion", () => {
  const titulo = unico("Aviso de prueba e2e");

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await ingresar(page, "direccion");
    await borrarAvisos(page, [titulo]);
    await page.close();
  });

  test("recorre todas las rutas accesibles", async ({ page }) => {
    const errores: string[] = [];
    page.on("pageerror", (e) => errores.push(`${page.url()}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errores.push(`${page.url()}: ${m.text()}`);
    });
    await ingresar(page, "direccion");

    for (const ruta of RUTAS) {
      await page.goto(ruta);
      await expect(page).toHaveURL(new RegExp(`${ruta}(\\?|$)`));
      await pantallaSinErrores(page);
      await capturar(page, `direccion${ruta.replaceAll("/", "-")}`);
    }

    // Más: Dirección ve Gestión y Publicar.
    await page.goto("/mas");
    const mas = page.getByRole("navigation", { name: "Más secciones" });
    await expect(mas.getByRole("link", { name: /Gestión/ })).toBeVisible();
    await expect(mas.getByRole("link", { name: /Publicar/ })).toBeVisible();

    // Gestión: las cuatro pestañas.
    await page.goto("/gestion");
    for (const nombre of ["Buzón", "Tareas", "Pedidos", "Usuarios"]) {
      await page.getByRole("tab", { name: nombre }).click();
      await pantallaSinErrores(page);
    }

    // Detalle de un pedido (el tablero de Dirección los ve todos).
    const res = await page.request.get("/api/proxy/pedidos/todos");
    const pedidos = (await res.json()) as { id: number }[];
    expect(pedidos.length).toBeGreaterThan(0);
    await page.goto(`/pedidos/${pedidos[0].id}`);
    await pantallaSinErrores(page);
    await expect(page.getByRole("heading", { name: "Historial" })).toBeVisible();
    await capturar(page, "direccion-pedidos-detalle");

    // Los documentos de la biblioteca existen y se abren.
    const docs = (await (await page.request.get("/api/proxy/biblioteca")).json()) as { url: string }[];
    expect(docs.length).toBeGreaterThan(0);
    for (const d of docs) {
      const r = await page.request.get(d.url);
      expect(r.status(), d.url).toBe(200);
      expect(r.headers()["content-type"]).toContain("application/pdf");
    }

    expect(errores, "errores de JavaScript o de red en la consola").toEqual([]);
  });

  test("crea un aviso, lo ve en Inicio, maestranza lo marca como leído y su campanita baja", async ({ page, browser }) => {
    await ingresar(page, "direccion");

    // Dirección publica un aviso para todo el Centro con confirmación de lectura.
    await page.goto("/publicar");
    const form = page.getByRole("form", { name: "Publicar aviso" });
    await form.getByLabel("Título").fill(titulo);
    await form.getByLabel("Texto").fill("Aviso creado por la prueba de punta a punta.");
    await form.getByLabel("Pedir confirmación de lectura").check();
    await form.getByRole("button", { name: "Publicar aviso" }).click();
    await expect(page.getByRole("status").getByText("Aviso publicado")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Publicados" })).toHaveAttribute("aria-selected", "true");

    // Lo ve en Inicio.
    await page.goto("/inicio");
    await expect(page.getByRole("article").filter({ hasText: titulo })).toBeVisible();

    // Maestranza, en otro navegador.
    const ctx = await browser.newContext();
    const m = await ctx.newPage();
    await ingresar(m, "maestranza");
    const antes = await contadorBackend(m);
    expect(antes).toBeGreaterThan(0);
    await expect(badge(m)).toHaveAttribute("data-valor", String(antes));

    const aviso = m.getByRole("article").filter({ hasText: titulo });
    await expect(aviso).toBeVisible();
    await aviso.getByRole("button", { name: "Marcar como leído" }).click();
    await expect(aviso.getByText("Leído", { exact: true })).toBeVisible();

    // La campanita baja en pantalla y en el backend.
    await expect(badge(m)).toHaveAttribute("data-valor", String(antes - 1));
    expect(await contadorBackend(m)).toBe(antes - 1);
    await ctx.close();
  });
});
