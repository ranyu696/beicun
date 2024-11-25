import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'd67623013be0bb7162f0eb9ba6a9fd78.r2.cloudflarestorage.com',
      'img.beicunceping.com'  // 如果你使用自定义域名
    ],
  },
  env: {
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_API_TOKEN: process.env.R2_API_TOKEN,
  },
};

export default nextConfig;
