/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*'], // Permitir acceso desde cualquier dispositivo en la red local
  // Desactivar indicadores / Dev Tools UI del modo desarrollo
  devIndicators: false,
};

export default nextConfig;
