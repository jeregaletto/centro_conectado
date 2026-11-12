import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Corremos los tests con la zona horaria de Buenos Aires (UTC-3): es donde aparecía el bug
// de "fecha sin hora = día anterior". Si fechas.ts depende de la zona del proceso, falla acá.
process.env.TZ = "America/Argentina/Buenos_Aires";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
