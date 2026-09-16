import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's default is 1MB, which silently fails (uncaught request
      // error, never reaches our own file-size validation) for any photo
      // upload - business logo, product, or portfolio - once multipart
      // overhead pushes the request past that. Raised with headroom above
      // our largest allowed upload (2MB for product/portfolio photos).
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
