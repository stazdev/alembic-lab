import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — a stray lockfile in the home directory otherwise
  // makes Next infer the wrong root.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
