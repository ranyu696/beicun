import { ProductTabs } from "@/components/products/product-tabs"



interface ProductLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
  content: React.ReactNode
  specs: React.ReactNode
  reviews: React.ReactNode
  ratings: React.ReactNode
}

export default function ProductLayout({
  children,
  modal,
  content,
  specs,
  reviews,
  ratings,
}: ProductLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 主要内容区域 */}
      <div className="space-y-6">
        {children}
        <ProductTabs
          contentTab={content}
          specsTab={specs}
          reviewsTab={reviews}
          ratingsTab={ratings}
        />
      </div>

      {/* 模态框 */}
      {modal}
    </div>
  )
}