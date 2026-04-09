import type { NextConfig } from "next";

/* Parametros adicionados para permitir Server Actions no ambiente de preview do GitHub Codespaces 
* Espero não ter problemas ao subir em prod ç-ç
*/
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.app.github.dev",
      ]
    }
  }
};

export default nextConfig;
