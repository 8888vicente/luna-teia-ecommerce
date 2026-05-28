/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*'], // Permitir acceso desde cualquier dispositivo en la red local
};

export default nextConfig;
