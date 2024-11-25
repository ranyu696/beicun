import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./zod"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import type { User } from "next-auth"
import { UserRole } from "@prisma/client"
import { compare } from "bcryptjs"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 1. 会话配置
  session: {
    strategy: "jwt", // 使用 JWT 存储会话
    maxAge: 30 * 24 * 60 * 60, // 30天过期
  },
  
  // 2. 自定义页面路由
  pages: {
    signIn: '/login',      // 登录页
    signOut: '/logout',    // 登出页
    error: '/auth/error',  // 错误页
    verifyRequest: '/auth/verify-request', // 验证请求页
  },

  // 3. 回调函数
  callbacks: {
    // JWT 回调：可以自定义 JWT 中的数据
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
      }
      return token
    },
    
    // Session 回调：可以自定义返回给客户端的会话数据
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          // 1. 验证输入
          if (!credentials?.email || !credentials?.password) {
            throw new Error("请输入邮箱和密码")
          }

          // 2. 验证数据格式
          const { email, password } = await signInSchema.parseAsync(credentials)

          // 3. 查找用户
          const user = await prisma.user.findUnique({
            where: { email }
          })

          // 4. 验证用户存在
          if (!user) {
            throw new Error("邮箱或密码错误")
          }

          // 5. 验证密码
          const isPasswordValid = await compare(password, user.password!)
          if (!isPasswordValid) {
            throw new Error("邮箱或密码错误")
          }

          // 6. 验证邮箱是否已验证（如果需要）
          if (!user.emailVerified) {
            throw new Error("请先验证您的邮箱")
          }

          // 7. 返回用户信息
          return {
            id: user.id,
            name: user.name || null,
            email: user.email,
            image: user.image || null,
            role: user.role
          }
        } catch (error) {
          console.error("认证错误:", error)
          return null
        }
      },
    }),
  ],
})