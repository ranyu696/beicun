import { Metadata } from "next"
import { ChannelTypeForm } from "@/components/admin/categories/channel-types/ChannelTypeForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "编辑通道类型 - 后台管理",
  description: "编辑通道类型信息",
}

type Params = Promise<{ id: string }>   

export default async function EditChannelTypePage({ params }: { params: Params }) {
  const { id } = await params
  const channelType = await prisma.channelType.findUnique({
    where: {
      id
    }
  })

  if (!channelType) {
    notFound()
  }

  // 转换日期为字符串
  const formattedChannelType = {
    ...channelType,
    createdAt: channelType.createdAt.toISOString(),
    updatedAt: channelType.updatedAt.toISOString()
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">编辑通道类型</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <ChannelTypeForm initialData={formattedChannelType} />
        </div>
      </div>
    </div>
  )
}