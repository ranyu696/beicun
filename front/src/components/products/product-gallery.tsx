"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import { MainImage, SalesImage, ProductImage } from "@/types/product"

type ImageType = MainImage | SalesImage | ProductImage

interface ProductGalleryProps {
  mainImage?: ImageType | null
  detailImages: ImageType[]
}

export function ProductGallery({ mainImage, detailImages }: ProductGalleryProps) {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN || ''

  // 检查图片是否有描述（用于区分 ProductImage 类型）
  const isProductImage = (image: ImageType): image is ProductImage => {
    return 'description' in image
  }

  return (
    <div className="space-y-4">
      {/* 主图显示 */}
      {mainImage && (
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={`${imageBaseUrl}${mainImage.url}`}
            alt="产品主图"
            width={mainImage.width}
            height={mainImage.height}
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* 图集模态框 */}
      {detailImages.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <ImageIcon className="mr-2 h-4 w-4" />
              查看官方图集 ({detailImages.length}张)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogTitle className="text-lg font-semibold mb-4">
              官方图集
            </DialogTitle>
            
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="grid grid-cols-1 gap-4">
                {detailImages.map((image, index) => (
                  <div 
                    key={index}
                    className="relative w-full rounded-lg overflow-hidden bg-muted"
                  >
                    <Image
                      src={`${imageBaseUrl}${image.url}`}
                      alt={isProductImage(image) ? image.description : `详情图 ${index + 1}`}
                      width={image.width}
                      height={image.height}
                      className="w-full h-auto object-contain"
                      priority={index < 2} // 只优先加载前两张图片
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}