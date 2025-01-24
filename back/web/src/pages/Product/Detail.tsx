import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/services/product'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { MainImage, SalesImage, type ProductImage } from '@/types/product'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()

  // 获取产品详情
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productApi.getProduct(id!)
      console.log('API Response:', response)  
      return response.data
    },
    enabled: !!id,
  })

  if (isLoadingProduct || !productData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-muted-foreground">加载中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 产品基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>{productData.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              创建时间：{
                productData.createdAt && !isNaN(new Date(productData.createdAt).getTime())
                  ? format(new Date(productData.createdAt), 'yyyy-MM-dd HH:mm:ss')
                  : '未知'
              }
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">价格</div>
                    <div>¥{productData.price}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">版本</div>
                    <div>{productData.version}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">尺寸信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">高度</div>
                    <div>{productData.height}mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">宽度</div>
                    <div>{productData.width}mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">长度</div>
                    <div>{productData.length}mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">重量</div>
                    <div>{productData.weight}g</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">产品特性</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">刺激度：{productData.stimulation}</Badge>
                  <Badge variant="secondary">软硬度：{productData.softness}</Badge>
                  <Badge variant="secondary">紧致度：{productData.tightness}</Badge>
                  <Badge variant="secondary">气味：{productData.smell}</Badge>
                  <Badge variant="secondary">油腻度：{productData.oiliness}</Badge>
                  <Badge variant="secondary">耐久度：{productData.durability}</Badge>
                  <Badge variant="secondary">
                    {productData.isReversible ? '可翻转' : '不可翻转'}
                  </Badge>
                </div>
              </div>

              {productData.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">产品描述</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {productData.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 产品图片 */}
        <Card>
          <CardHeader>
            <CardTitle>产品图片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 主图 */}
              {!productData.mainImage?.length && !productData.salesImage?.length && !productData.productImages?.length && (
                <div className="text-center text-muted-foreground py-8">
                  暂无图片
                </div>
              )}

              {productData.mainImage && productData.mainImage.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">主图</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {productData.mainImage.map((image: MainImage, index: number) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`主图 ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {productData.mainImage?.length > 0 && productData.salesImage?.length > 0 && <Separator />}

              {/* 销售图 */}
              {productData.salesImage && productData.salesImage.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">销售图</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {productData.salesImage.map((image: SalesImage, index: number) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`销售图 ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {(productData.salesImage?.length > 0 || productData.mainImage?.length > 0) && 
               productData.productImages && productData.productImages.length > 0 && <Separator />}

              {/* 产品图片 */}
              {productData.productImages && productData.productImages.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">产品图片</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {productData.productImages.map((image: ProductImage, index: number) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`产品图片 ${index + 1}`}
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
