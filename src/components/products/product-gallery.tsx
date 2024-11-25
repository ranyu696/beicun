"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

interface ProductGalleryProps {
  mainImage: string
  detailImages: string[]
}

export function ProductGallery({ mainImage, detailImages }: ProductGalleryProps) {
  return (
    <div className="space-y-4">
      {/* 主图显示 */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={mainImage}
          alt="产品主图"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

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
              <div className="space-y-0">  {/* 图片间距控制 */}
                {detailImages.map((image, index) => (
                  <div 
                    key={index}
                    className="relative aspect-auto w-full rounded-lg overflow-hidden bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`详情图 ${index + 1}`}
                      width={800}
                      height={1200}
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