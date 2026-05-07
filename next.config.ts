import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to the project directory so it doesn't
  // climb up when multiple lockfiles exist higher in the filesystem.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      // Supabase Storage public URLs will go here once the project is set up.
    ],
  },
};

export default nextConfig;
