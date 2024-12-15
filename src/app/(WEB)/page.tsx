import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ReviewCard } from "@/components/review-card";
import { BrandCard } from "@/components/brand-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { HeroFilter } from "@/components/home/hero-filter";

// 获取数据
export default async function Home() {
  // 获取品牌
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  // 获取最新评测
  const latestReviews = await prisma.review.findMany({
    take: 3,
    where: {
      status: 'PUBLISHED'
    },
    orderBy: { 
      createdAt: 'desc' 
    },
    select: {
      id: true,
      title: true,
      unboxing: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          brand: {
            select: {
              name: true
            }
          }
        }
      },
      author: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });

  // 获取热门产品
  const hotProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { viewCount: 'desc' },
    include: {
      brand: true,
      utilityType: true,
      ratings: true
    }
  });

  // 获取筛选选项
  const [brandOptions, productTypes, utilityTypes, materialTypes, channelTypes] = await Promise.all([
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.productType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.utilityType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.materialType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.channelType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    })
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section with Filter */}
      <HeroFilter
        brands={brands}
        productTypes={productTypes}
        utilityTypes={utilityTypes}
        materialTypes={materialTypes}
        channelTypes={channelTypes}
      />

      {/* Hot Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800">热门产品</h3>
            <Link href="/products" className="text-primary hover:underline">
              查看更多
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {hotProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800">最新评测</h3>
            <Link href="/reviews" className="text-primary hover:underline">
              查看更多
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800">品牌展示</h3>
            <Link href="/brands" className="text-primary hover:underline">
              查看更多
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}