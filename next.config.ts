/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['bcrypt'],
}

export default nextConfig;
