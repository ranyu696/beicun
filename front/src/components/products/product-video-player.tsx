"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Play, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductVideoPlayerProps {
  url: string
}

export function ProductVideoPlayer({ url }: ProductVideoPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mediaBaseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN || ''

  // 处理视频加载状态
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // 处理展开/收起
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
    if (!isExpanded) {
      setIsLoading(true)
    }
  }, [isExpanded])

  // 获取完整的视频 URL
  const getVideoUrl = (videoUrl: string): string => {
    return `${mediaBaseUrl}${videoUrl}`
  }

  return (
    <Card className="overflow-hidden">
      <Button
        variant="ghost"
        onClick={toggleExpand}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          <span>产品视频介绍</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isExpanded ? "h-[480px]" : "h-0"
        )}
      >
        {isExpanded && (
          <div className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <iframe
              src={getVideoUrl(url)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={handleIframeLoad}
            />
          </div>
        )}
      </div>
    </Card>
  )
}