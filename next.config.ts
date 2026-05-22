import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Define explicitamente a raiz do workspace para evitar
  // aviso "inferred workspace root" quando há lockfiles em parent dirs.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // PT-BR como locale default no HTML
  // (a app é single-locale por enquanto — multi-locale via next-intl quando necessário)

  // Logs estruturados em produção
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  experimental: {
    // Ativações futuras conforme estabilização
  },
};

export default nextConfig;
