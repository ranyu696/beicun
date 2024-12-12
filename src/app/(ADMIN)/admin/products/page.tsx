import { ProductList } from '@/components/admin/products/ProductList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Heading } from '@/components/ui/heading'

export default function ProductsPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="产品管理"
            description="管理你的产品列表"
          />
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增产品
            </Button>
          </Link>
        </div>
        <ProductList />
      </div>
    </div>
  )
}