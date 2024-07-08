/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'lgavwlmakxlovnqymfwk.supabase.co'
          }
        ]
      }
};

export default nextConfig;
