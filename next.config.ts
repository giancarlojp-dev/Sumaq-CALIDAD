import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Esto permite TODAS las fotos de Google
      },
    ],
  },
};

export default nextConfig;
// Si quieres agregar más configuraciones,
/*
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ['example.com'], // Agrega los dominios de las imágenes que usarás
  },
};
*/