export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/upload/:path*', // 上传相关API
    '/api/products/:path*' // 产品相关API
  ]
}