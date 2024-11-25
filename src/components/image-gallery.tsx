'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@/components/ui/dialog'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0])
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <Image
          src={mainImage}
          alt={alt}
          fill
          className="object-cover cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`relative aspect-square rounded-md overflow-hidden ${
              image === mainImage ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setMainImage(image)}
          >
            <Image
              src={image}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 10vw"
            />
          </button>
        ))}
      </div>

      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <Image
            src={mainImage}
            alt={alt}
            width={1200}
            height={1200}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      </Dialog>
    </div>
  )
}