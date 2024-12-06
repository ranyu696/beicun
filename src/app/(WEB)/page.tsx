import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { FilterDialog } from "@/components/filter-dialog";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ReviewCard } from "@/components/review-card";
import { BrandCard } from "@/components/brand-card";
import { FilterSelect } from "@/components/ui/filter-select";

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
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-800">探索杯村</h2>
              <p className="text-xl text-gray-600">发现你的理想选择</p>
            </div>

            {/* 筛选区域 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <FilterSelect
                  label="品牌"
                  options={brandOptions}
                  placeholder="选择品牌"
                />
                 <FilterSelect
                  label="类型"
                  options={productTypes}
                  placeholder="选择类型"
                />
                <FilterSelect
                  label="器具"
                  options={utilityTypes}
                  placeholder="选择器具"
                />
                <FilterSelect
                  label="材质"
                  options={materialTypes}
                  placeholder="选择材质"
                />
                <FilterSelect
                  label="通道"
                  options={channelTypes}
                  placeholder="选择通道"
                />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="outline">
                  重置
                </Button>
                <Button size="lg" className="min-w-[120px]">
                  搜索
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

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