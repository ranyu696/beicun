"use client"

import { ProductCard } from "@/components/product-card"
import { Separator } from "@/components/ui/separator"
import { ProductSort } from "@/components/search/product-sort"
import { Pagination } from "@/components/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { SearchInput } from "@/components/search/search-input"
import { Package2, FileText, Building2 } from "lucide-react"
import { ReviewCard } from "@/components/review-card"
import { BrandCard } from "@/components/brand-card"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { searchProducts, searchReviews, searchBrands, searchAll } from "@/app/actions/search"
import type { Product } from "@/types/product"
import type { Review } from "@/types/review"
import type { Brand } from "@/types/brand"

export interface SearchResult<T> {
  total: number
  list: T[]
}

export interface SearchResults {
  products?: SearchResult<Product>
  reviews?: SearchResult<Review>
  brands?: SearchResult<Brand>
}

const searchTypeLabels = {
  all: '内容',
  products: '产品',
  reviews: '测评',
  brands: '品牌'
} as const

export type SearchType = keyof typeof searchTypeLabels

function SearchParamsReader({ 
  onParamsChange 
}: { 
  onParamsChange: (params: { 
    query: string, 
    searchType: SearchType, 
    page: number, 
    sort: string 
  }) => void 
}) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const query = searchParams.get('q') || ''
    const searchType = (searchParams.get('type') as SearchType) || 'all'
    const page = Number(searchParams.get('page')) || 1
    const sort = searchParams.get('sort') || 'newest'
    
    onParamsChange({ query, searchType, page, sort })
  }, [searchParams, onParamsChange])
  
  return null
}

function SearchResults({ params }: { 
  params: { 
    query: string, 
    searchType: SearchType, 
    page: number, 
    sort: string 
  } 
}) {
  const [results, setResults] = useState<SearchResults>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { query, searchType, page, sort } = params
  const pageSize = 24

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return

      setIsLoading(true)
      setError(null)

      try {
        if (searchType === 'all') {
          const data = await searchAll(query)
          setResults(data)
        } else if (searchType === 'products') {
          const data = await searchProducts({ 
            query, 
            page, 
            pageSize,
            sort
          })
          setResults({ products: data })
        } else if (searchType === 'reviews') {
          const data = await searchReviews({ 
            query, 
            page, 
            pageSize,
            sort
          })
          setResults({ reviews: data })
        } else if (searchType === 'brands') {
          const data = await searchBrands({ 
            query, 
            page, 
            pageSize,
            sort
          })
          setResults({ brands: data })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '搜索失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, searchType, page, sort])

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-center">搜索</h1>
          <SearchInput className="w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <EmptyCard 
              icon={Package2}
              title="产品"
              description="搜索你感兴趣的名器"
            />
            <EmptyCard 
              icon={FileText}
              title="测评"
              description="探索详细的产品测评"
            />
            <EmptyCard 
              icon={Building2}
              title="品牌"
              description="了解知名品牌故事"
            />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <SearchInput className="w-full" />
          <Card className="p-6 text-center">
            <CardContent>
              <h2 className="text-lg font-medium mb-2">搜索时出现错误</h2>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <SearchInput className="w-full" />
          <div className="text-center py-8">
            <p className="text-muted-foreground">正在搜索...</p>
          </div>
        </div>
      </div>
    )
  }

  const hasResults = Object.values(results).some(result => 
    result?.total > 0 || result?.list?.length > 0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="max-w-3xl mx-auto">
          <SearchInput className="w-full" />
        </div>

        {!hasResults ? (
          <div className="text-center py-8">
            <h2 className="text-lg font-medium mb-2">
              未找到与 &ldquo;{query}&rdquo; 相关的{searchTypeLabels[searchType]}
            </h2>
            <p className="text-muted-foreground">
              试试其他关键词，或者切换搜索类型
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {searchType === 'all' ? (
              <>
                {results.products && results.products.total > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4">
                      产品
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        共 {results.products.total} 件
                      </span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {results.products.list.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                )}

                {results.reviews && results.reviews.total > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4">
                      测评
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        共 {results.reviews.total} 篇
                      </span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {results.reviews.list.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </section>
                )}

                {results.brands && results.brands.total > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4">
                      品牌
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        共 {results.brands.total} 个
                      </span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {results.brands.list.map((brand) => (
                        <BrandCard key={brand.id} brand={brand} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : searchType === 'products' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    产品
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      共 {results.products?.total ?? 0} 件
                    </span>
                  </h2>
                  <ProductSort sort={sort} />
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.products?.list.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {(results.products?.total ?? 0) > pageSize && (
                  <div className="flex justify-center pt-6">
                    <Pagination
                      total={results.products?.total ?? 0}
                      pageSize={pageSize}
                      currentPage={page}
                    />
                  </div>
                )}
              </div>
            ) : searchType === 'reviews' ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    测评
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      共 {results.reviews?.total ?? 0} 篇
                    </span>
                  </h2>
                  <ProductSort sort={sort} />
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.reviews?.list.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {(results.reviews?.total ?? 0) > pageSize && (
                  <div className="flex justify-center pt-6">
                    <Pagination
                      total={results.reviews?.total ?? 0}
                      pageSize={pageSize}
                      currentPage={page}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    品牌
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      共 {results.brands?.total ?? 0} 个
                    </span>
                  </h2>
                  <ProductSort sort={sort} />
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.brands?.list.map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                  ))}
                </div>

                {(results.brands?.total ?? 0) > pageSize && (
                  <div className="flex justify-center pt-6">
                    <Pagination
                      total={results.brands?.total ?? 0}
                      pageSize={pageSize}
                      currentPage={page}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useState({
    query: '',
    searchType: 'all' as SearchType,
    page: 1,
    sort: 'newest'
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense>
        <SearchParamsReader onParamsChange={setSearchParams} />
      </Suspense>
      <SearchResults params={searchParams} />
    </div>
  )
}

function EmptyCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any
  title: string
  description: string
}) {
  return (
    <Card className="p-6">
      <CardContent className="space-y-4 text-center">
        <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}