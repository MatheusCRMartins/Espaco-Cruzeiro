import type { NextConfig } from "next";

// Hostname do Supabase Storage — extraído do NEXT_PUBLIC_SUPABASE_URL
// pra que <Image src> funcione com fotos do bucket public-assets.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to the project directory so it doesn't
  // climb up when multiple lockfiles exist higher in the filesystem.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
