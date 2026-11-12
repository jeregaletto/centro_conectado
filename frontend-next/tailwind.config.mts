import type { Config } from "tailwindcss";

/**
 * Paleta y tipografía del login original (frontend/login.html). No inventar colores nuevos:
 * los valores viven como variables CSS en app/globals.css y acá se exponen como clases de Tailwind.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pared: "var(--pared)",
        "pared-2": "var(--pared-2)",
        tinta: "var(--tinta)",
        "tinta-suave": "var(--tinta-suave)",
        papel: "var(--papel)",
        borde: "var(--borde)",
        senal: "var(--senal)",
        error: "var(--error)",
        "error-fondo": "var(--error-fondo)",
        ok: "var(--ok)",
        "ok-fondo": "var(--ok-fondo)",
        info: "var(--info)",
        "info-fondo": "var(--info-fondo)",
        alerta: "var(--alerta)",
        "alerta-fondo": "var(--alerta-fondo)",
        rol: "var(--color-rol)",
        "texto-rol": "var(--texto-rol)",
        "l-direccion": "var(--l-direccion)",
        "l-comunicacion": "var(--l-comunicacion)",
        "l-referente": "var(--l-referente)",
        "l-profesional": "var(--l-profesional)",
        "l-administrativo": "var(--l-administrativo)",
        "l-maestranza": "var(--l-maestranza)",
      },
      fontFamily: {
        sans: ["var(--fuente)"],
      },
      borderRadius: {
        cc: "var(--radio)",
      },
      minHeight: {
        toque: "var(--toque)",
      },
    },
  },
};

export default config;
