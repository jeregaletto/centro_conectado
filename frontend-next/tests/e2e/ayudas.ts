import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Centro2026!";
export const CAPTURAS = "tests/e2e/capturas";

/** Entra por el formulario de login, como una persona. */
export async function ingresar(page: Page, usuario: string) {
  await page.goto("/login");
  await page.getByLabel("DNI o usuario").fill(usuario);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/inicio");
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
}

/** Contador de la campanita según el backend (vía el proxy, con la cookie de la página). */
export async function contadorBackend(page: Page): Promise<number> {
  const res = await page.request.get("/api/proxy/notificaciones/contador");
  expect(res.ok()).toBeTruthy();
  const cuerpo = (await res.json()) as { noLeidas: number };
  return cuerpo.noLeidas;
}

/** Número que muestra la campanita en pantalla. */
export function badge(page: Page) {
  return page.getByTestId("contador-notificaciones").first();
}

/** Sin mensajes de error en pantalla y con su título. */
export async function pantallaSinErrores(page: Page) {
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator('[role="alert"] > div')).toHaveCount(0);
}

export async function capturar(page: Page, nombre: string) {
  await page.screenshot({ path: `${CAPTURAS}/${nombre}.png`, fullPage: true });
}

export function unico(prefijo: string): string {
  return `${prefijo} ${Date.now().toString(36)}`;
}

/** Borra avisos de prueba que hayan quedado (por título), con la sesión de la página. */
export async function borrarAvisos(page: Page, titulos: string[]) {
  const res = await page.request.get("/api/proxy/avisos");
  if (!res.ok()) return;
  const avisos = (await res.json()) as { id: number; titulo: string }[];
  for (const a of avisos.filter((x) => titulos.includes(x.titulo))) {
    await page.request.delete(`/api/proxy/avisos/${a.id}`);
  }
}
