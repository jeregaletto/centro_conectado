import { expect, test } from "@playwright/test";

import { borrarAvisos, capturar, ingresar, unico } from "./ayudas";

const SOLO_TU_SECTOR = "Como referente solo podés publicar para tu sector";

test.describe("referente.enf", () => {
  const titulo = unico("Aviso Enfermería e2e");
  const tituloKine = unico("Aviso Kinesiología e2e");

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await ingresar(page, "referente.enf");
    await borrarAvisos(page, [titulo, tituloKine]);
    await page.close();
  });

  test("publica para Enfermería y no puede publicar para Kinesiología", async ({ page }) => {
    await ingresar(page, "referente.enf");
    await page.goto("/publicar");
    const form = page.getByRole("form", { name: "Publicar aviso" });
    const destinos = form.getByRole("group", { name: "¿Para quién?" });

    // Solo ve su sector, ya marcado.
    await expect(destinos.getByRole("checkbox")).toHaveCount(1);
    await expect(destinos.getByRole("checkbox", { name: "Enfermería" })).toBeChecked();
    await capturar(page, "referente-publicar");

    // 1) Aviso para Enfermería: se publica.
    await form.getByLabel("Título").fill(titulo);
    await form.getByLabel("Texto").fill("Prueba de punta a punta para el sector.");
    await form.getByRole("button", { name: "Publicar aviso" }).click();
    await expect(page.getByRole("status").getByText("Aviso publicado")).toBeVisible();
    await expect(page.getByRole("article").filter({ hasText: titulo }).first()).toContainText("Para Enfermería");

    // 2) Intento para Kinesiología con el formulario manipulado (el destino cambiado a mano en el navegador):
    //    la validación lo frena con el mensaje debajo del campo "¿Para quién?".
    const sectores = (await (await page.request.get("/api/proxy/sectores")).json()) as { id: number; nombre: string }[];
    const kinesiologia = sectores.find((s) => s.nombre === "Kinesiología");
    expect(kinesiologia).toBeDefined();

    await page.getByRole("tab", { name: "Aviso" }).click();
    await form.getByLabel("Título").fill(tituloKine);
    await form.getByLabel("Texto").fill("No debería publicarse.");
    await destinos
      .getByRole("checkbox")
      .evaluate((el, id) => ((el as HTMLInputElement).value = String(id)), kinesiologia?.id ?? 0);
    await form.getByRole("button", { name: "Publicar aviso" }).click();
    await expect(destinos).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#grupo-sectorIds-error")).toHaveText(SOLO_TU_SECTOR);
    await capturar(page, "referente-publicar-kinesiologia");

    // 3) Y si alguien saltea el frontend, el backend lo rechaza igual (la seguridad real está ahí).
    const res = await page.request.post("/api/proxy/avisos", {
      data: {
        titulo: tituloKine,
        cuerpo: "x",
        tipo: "NOVEDAD",
        fijado: false,
        requiereLectura: false,
        vigenteHasta: null,
        sectorIds: [kinesiologia?.id],
      },
    });
    expect(res.status()).toBe(400);
    expect(((await res.json()) as { campos: Record<string, string> }).campos.sectorIds).toBe(SOLO_TU_SECTOR);
  });
});
