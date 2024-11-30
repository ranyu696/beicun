import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

type Params = Promise<{ id: string }>

export async function GET(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    if (!id) {
      return new NextResponse("器具类型ID必填", { status: 400 })
    }

    const utilityType = await prisma.utilityType.findUnique({
      where: {
        id
      }
    })
  
    return NextResponse.json(utilityType)
  } catch (error) {
    console.error('获取器具类型失败:', error)
    return new NextResponse("获取器具类型失败", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("未授权", { status: 401 })
    }

    const body = await req.json()

    const { id } = await params
    if (!id) {
      return new NextResponse("器具类型ID必填", { status: 400 })
    }

    const utilityType = await prisma.utilityType.update({
      where: {
        id
      },
      data: body
    })
  
    return NextResponse.json(utilityType)
  } catch (error) {
    console.error('更新器具类型失败:', error)
    return new NextResponse("更新器具类型失败", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("未授权", { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return new NextResponse("器具类型ID必填", { status: 400 })
    }

    const utilityType = await prisma.utilityType.delete({
      where: {
        id
      }
    })
  
    return NextResponse.json(utilityType)
  } catch (error) {
    console.error('删除器具类型失败:', error)
    return new NextResponse("删除器具类型失败", { status: 500 })
  }
} 