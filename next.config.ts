import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || '',
            },
        ],
    },
    eslint: {
        dirs: ['app', 'lib'],
    },
};

export default nextConfig;
