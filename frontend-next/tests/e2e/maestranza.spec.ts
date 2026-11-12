import { expect, test } from "@playwright/test";

import { capturar, ingresar, pantallaSinErrores } from "./ayudas";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.describe("maestranza (vista simple, 390×844)", () => {
  test("barra de 4 botones, tilda una tarea y no puede publicar", async ({ page }) => {
    await ingresar(page, "maestranza");

    // Barra inferior: Inicio, Mi puesto, Pedidos, Buzón.
    const barra = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(barra.getByRole("link")).toHaveText(["Inicio", "Mi puesto", "Pedidos", "Buzón"]);
    await expect(page.locator('[data-vista="SIMPLE"]')).toBeVisible();

    // Objetivos táctiles de al menos 56 px y texto de al menos 19 px.
    const caja = await barra.getByRole("link", { name: "Mi puesto" }).boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(56);
    const tamano = await page.locator('[data-vista="SIMPLE"]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(tamano).toBeGreaterThanOrEqual(19);
    await capturar(page, "maestranza-inicio");

    // Tildar una tarea: la pantalla se actualiza con la respuesta del backend.
    await barra.getByRole("link", { name: "Mi puesto" }).click();
    await page.waitForURL("**/mi-puesto");
    await pantallaSinErrores(page);
    const tarea = page.getByRole("button", { pressed: false }).first();
    const nombre = (await tarea.locator("span.font-bold").first().textContent()) ?? "";
    const avanceAntes = await page.getByTestId("avance-texto").textContent();
    await tarea.click();
    const tildada = page.getByRole("button", { name: new RegExp(nombre.trim()) });
    await expect(tildada).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("avance-texto")).not.toHaveText(avanceAntes ?? "");
    const tamanoTarea = await tildada.boundingBox();
    expect(tamanoTarea?.height ?? 0).toBeGreaterThanOrEqual(56);
    await capturar(page, "maestranza-mi-puesto");

    // Destildar para dejar los datos de demo como estaban.
    await tildada.click();
    await expect(tildada).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("avance-texto")).toHaveText(avanceAntes ?? "");

    // Publicar y Gestión no son para este rol: vuelve a Inicio.
    await page.goto("/publicar");
    await expect(page).toHaveURL(/\/inicio$/);
    await page.goto("/gestion");
    await expect(page).toHaveURL(/\/inicio$/);

    // Y el backend lo rechaza igual si se intenta por la API: mensaje amigable, no técnico.
    const res = await page.request.post("/api/proxy/avisos", {
      data: { titulo: "x", cuerpo: "x", tipo: "NOVEDAD", fijado: false, requiereLectura: false, vigenteHasta: null, sectorIds: [] },
    });
    expect(res.status()).toBe(403);

    for (const ruta of ["/pedidos", "/buzon"]) {
      await page.goto(ruta);
      await pantallaSinErrores(page);
      await capturar(page, `maestranza${ruta.replaceAll("/", "-")}`);
    }
  });
});
