import { Metadata } from "next"
import { ReviewForm } from "@/components/admin/reviews/ReviewForm"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "编辑测评 - 后台管理",
  description: "编辑产品测评",
}

interface EditReviewPageProps {
  params: {
    id: string
  }
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // 获取测评数据
  const review = await prisma.review.findUnique({
    where: {
      id: params.id
    }
  })

  if (!review) {
    notFound()
  }

  // 获取所有有效的产品（关联的品牌、类型都是激活状态的）
  const products = await prisma.product.findMany({
    where: {
      brand: {
        isActive: true
      },
      productType: {
        isActive: true
      },
      channelType: {
        isActive: true
      },
      materialType: {
        isActive: true
      }
    },
    select: {
      id: true,
      name: true,
      brand: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      {
        brand: {
          name: 'asc'
        }
      },
      {
        name: 'asc'
      }
    ]
  })

  // 格式化产品数据，添加品牌名称
  const formattedProducts = products.map(product => ({
    id: product.id,
    name: `${product.brand.name} - ${product.name}`
  }))

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">编辑测评</h2>
      </div>

      <div className="border-t">
        <div className="max-w-4xl py-6">
          <ReviewForm 
            products={formattedProducts} 
            initialData={review}
          />
        </div>
      </div>
    </div>
  )
}