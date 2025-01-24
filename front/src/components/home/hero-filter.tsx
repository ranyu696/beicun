"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterOption {
  id: string
  name: string
}

interface HeroFilterProps {
  brands: FilterOption[]
  productTypes: FilterOption[]
  utilityTypes: FilterOption[]
  materialTypes: FilterOption[]
  channelTypes: FilterOption[]
}

export function HeroFilter({
  brands,
  productTypes,
  utilityTypes,
  materialTypes,
  channelTypes,
}: HeroFilterProps) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    brand: '',
    type: '',
    utility: '',
    material: '',
    channel: ''
  })

  // 处理筛选器变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 重置筛选器
  const handleReset = () => {
    setFilters({
      brand: '',
      type: '',
      utility: '',
      material: '',
      channel: ''
    })
  }

  // 执行搜索
  const handleSearch = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* 视频背景 */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Anime-Girl-Games-CG.webm" type="video/webm" />
        </video>
        {/* 调整渐变透明度 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
      </div>

      {/* 内容区域 - 添加毛玻璃效果 */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* 标题区域使用毛玻璃效果 */}
          <div className="space-y-4 p-8 rounded-t-2xl bg-white/10 backdrop-blur-md">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">探索杯村</h2>
            <p className="text-xl text-gray-200">发现你的理想选择</p>
          </div>

          {/* 筛选区域 */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-b-2xl shadow-lg space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 品牌筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">品牌</label>
                <Select
                  value={filters.brand}
                  onValueChange={(value) => handleFilterChange('brand', value)}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder="选择品牌" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 产品类型筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">类型</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 器具类型筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">器具</label>
                <Select
                  value={filters.utility}
                  onValueChange={(value) => handleFilterChange('utility', value)}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder="选择器具" />
                  </SelectTrigger>
                  <SelectContent>
                    {utilityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 材料类型筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">材质</label>
                <Select
                  value={filters.material}
                  onValueChange={(value) => handleFilterChange('material', value)}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder="选择材质" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 通道类型筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">通道</label>
                <Select
                  value={filters.channel}
                  onValueChange={(value) => handleFilterChange('channel', value)}
                >
                  <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                    <SelectValue placeholder="选择通道" />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleReset}
                className="bg-white/90 hover:bg-white/100 transition-colors"
              >
                重置
              </Button>
              <Button 
                size="lg" 
                className="min-w-[120px] bg-primary/90 hover:bg-primary/100 transition-colors"
                onClick={handleSearch}
              >
                搜索
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 