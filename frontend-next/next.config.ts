import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (process.env.NODE_ENV === "production") return [];
    return {
      beforeFiles: [],
      afterFiles: [],
      // Solo en desarrollo: /api/* que no sea de Next (proxy, session) va directo al backend.
      // Va en `fallback` para no tapar la ruta dinámica /api/proxy/[...path].
      // La app NO usa esto: todas sus llamadas pasan por /api/proxy (agrega el token desde la cookie).
      // Sirve para probar a mano, por ejemplo /api/sectores sin token devuelve 401 del backend.
      fallback: [
        {
          source: "/api/:path((?!proxy/|proxy$|session$).*)",
          destination: `${BACKEND_URL}/api/:path`,
        },
      ],
    };
  },
};

export default nextConfig;
