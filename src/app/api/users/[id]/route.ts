import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

const roleSchema = z.object({
  role: z.enum(['USER', 'EDITOR', 'ADMIN'])
})

// GET 获取单个用户
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        // 可以添加更多需要的字段
        ratings: {
          select: {
            id: true,
            rating: true,
            reason: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        reviews: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            status: true,
            createdAt: true,
            review: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('获取用户失败:', error)
    return NextResponse.json(
      { error: "获取用户失败" },
      { status: 500 }
    )
  }
}

// PATCH 更新用户角色
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 不允许修改自己的角色
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: "不能修改自己的角色" },
        { status: 400 }
      )
    }

    const json = await request.json()
    const { role } = roleSchema.parse(json)

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('更新用户角色失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新用户角色失败" },
      { status: 500 }
    )
  }
}

// DELETE 删除用户
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 不允许删除自己
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: "不能删除自己的账号" },
        { status: 400 }
      )
    }

    // 删除用户的所有关联数据
    await prisma.$transaction([
      // 删除用户的评分
      prisma.productRating.deleteMany({
        where: { userId: params.id }
      }),
      // 删除用户的评论
      prisma.comment.deleteMany({
        where: { userId: params.id }
      }),
      // 删除用户的测评
      prisma.review.deleteMany({
        where: { userId: params.id }
      }),
      // 最后删除用户
      prisma.user.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    )
  }
}