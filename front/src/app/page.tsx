import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { ReviewCard } from "@/components/review-card"
import { BrandCard } from "@/components/brand-card"
import { HeroFilter } from "@/components/home/hero-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { getHotProducts } from "@/app/actions/products"
import { getReviews } from "@/app/actions/reviews"
import { getBrands } from "@/app/actions/brands"
import { getTypes } from "@/app/actions/types"
import { ReviewStatus } from "@/types/review"

// 设置页面重新验证时间
export const revalidate = 60

async function HotProducts() {
  const products = await getHotProducts()
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-800">热门产品</h3>
          <Link href="/products" className="text-primary hover:underline">
            查看更多
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

async function LatestReviews() {
  const { reviews } = await getReviews({
    page: 1,
    pageSize: 3,
    status: ReviewStatus.PUBLISHED
  })
  console.log('最新测评', reviews)
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-800">最新评测</h3>
          <Link href="/reviews" className="text-primary hover:underline">
            查看更多
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  )
}

async function BrandShowcase() {
  const brands = await getBrands({
    page: 1,
    pageSize: 8,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-800">品牌展示</h3>
          <Link href="/brands" className="text-primary hover:underline">
            查看更多
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {brands.list.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  )
}

async function FilterSection() {
  const [
    brands,
    productTypes,
    utilityTypes,
    materialTypes,
    channelTypes
  ] = await Promise.all([
    getBrands({ page: 1, pageSize: 100, sortBy: 'updatedAt', sortOrder: 'desc' }),
    getTypes('product', { page: 1, pageSize: 100 }),
    getTypes('utility', { page: 1, pageSize: 100 }),
    getTypes('material', { page: 1, pageSize: 100 }),
    getTypes('channel', { page: 1, pageSize: 100 })
  ])

  return (
    <HeroFilter
      brands={brands.list}
      productTypes={productTypes.list}
      utilityTypes={utilityTypes.list}
      materialTypes={materialTypes.list}
      channelTypes={channelTypes.list}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="h-[400px] bg-gray-100" />

      {/* Hot Products Section Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Reviews Section Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSkeleton />}>
        <FilterSection />
        <HotProducts />
        <LatestReviews />
        <BrandShowcase />
      </Suspense>
    </div>
  )
}