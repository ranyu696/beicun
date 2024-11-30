import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./zod"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"
import { compare } from "bcryptjs"

export const { handlers, auth } = NextAuth({
  // 1. 会话配置
  session: {
    strategy: "jwt", // 使用 JWT 存储会话
    maxAge: 30 * 24 * 60 * 60, // 30天过期
  },
  
  // 2. 自定义页面路由
  pages: {
    signIn: '/login',      // 登录页
    error: '/auth/error',  // 错误页
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

    async signIn({ user }) {
      try {
        if (!user?.email) {
          throw new Error("邮箱或密码错误")
        }

        // 查询用户的完整信息
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!dbUser) {
          throw new Error("用户不存在")
        }

        // 检查邮箱验证状态
        if (!dbUser.emailVerified) {
          throw new Error("邮箱未验证")
        }

        return true
      } catch (error) {
        // 直接抛出错误，让它传递到前端
        if (error instanceof Error) {
          throw error
        }
        throw new Error("认证失败")
      }
    },

    async authorized({ request, auth }) {
      // 获取当前路径
      const { pathname } = request.nextUrl
      
      // 检查是否已认证
      const isLoggedIn = !!auth?.user
      
      // 定义需要认证的路径
      const isProtected = pathname.startsWith('/admin')
      
      if (isProtected) {
        if (isLoggedIn) return true
        return false // 返回 false 将重定向到登录页面
      }
      
      return true // 不需要认证的页面
    }
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码")
        }

        try {
          const { email, password } = await signInSchema.parseAsync(credentials)

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user) {
            throw new Error("用户不存在")
          }

          const isPasswordValid = await compare(password, user.password!)
          if (!isPasswordValid) {
            throw new Error("邮箱或密码错误")
          }

          return {
            id: user.id,
            name: user.name || null,
            email: user.email,
            image: user.image || null,
            role: user.role
          }

        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error("认证失败")
        }
      },
    }),
  ],
})