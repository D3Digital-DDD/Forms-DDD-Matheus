import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Só vale em desenvolvimento: permite abrir o site pelo celular na mesma rede Wi-Fi.
  allowedDevOrigins: ["192.168.*.*"],
  /* config options here */
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
};

export default nextConfig;
