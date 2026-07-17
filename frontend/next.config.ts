import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Backend API URL - set NEXT_PUBLIC_API_URL in Vercel environment variables
const backendUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://backend-sandy-kappa-84.vercel.app/api"
    : "http://localhost:3000/api");
// Strip trailing /api if present to get base URL for rewrites
const backendBase = backendUrl.endsWith("/api")
  ? backendUrl.slice(0, -4)
  : backendUrl;

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
