"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface ProductFiltersProps {
  brands: Array<{ id: string; name: string }>
  types: Array<{ id: string; name: string }>
  materials: Array<{ id: string; name: string }>
  channels: Array<{ id: string; name: string }>
  utilities: Array<{ id: string; name: string }>
  selectedFilters: {
    brand?: string
    type?: string
    material?: string
    channel?: string
    utility?: string
    minPrice?: string
    maxPrice?: string
  }
}

export function ProductFilters({
  brands,
  types,
  materials,
  channels,
  utilities,
  selectedFilters
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState({
    min: selectedFilters.minPrice || '',
    max: selectedFilters.maxPrice || ''
  })

  // 更新筛选器
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // 重置页码
    params.delete('page')
    
    router.push(`/search?${params.toString()}`)
  }

  // 更新价格范围
  const updatePriceRange = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (priceRange.min) {
      params.set('minPrice', priceRange.min)
    } else {
      params.delete('minPrice')
    }
    
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max)
    } else {
      params.delete('maxPrice')
    }

    params.delete('page')
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <Accordion type="multiple" defaultValue={['brand', 'type', 'price', 'material', 'channel', 'utility']}>
      {/* 品牌筛选 */}
      <AccordionItem value="brand">
        <AccordionTrigger>品牌</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={brand.id}
                  checked={selectedFilters.brand === brand.id}
                  onCheckedChange={(checked) => {
                    updateFilters('brand', checked ? brand.id : null)
                  }}
                />
                <Label htmlFor={brand.id}>{brand.name}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 产品类型 */}
      <AccordionItem value="type">
        <AccordionTrigger>产品类型</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {types.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={selectedFilters.type === type.id}
                  onCheckedChange={(checked) => {
                    updateFilters('type', checked ? type.id : null)
                  }}
                />
                <Label htmlFor={type.id}>{type.name}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 通道类型 */}
      <AccordionItem value="channel">
        <AccordionTrigger>通道类型</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center space-x-2">
                <Checkbox
                  id={channel.id}
                  checked={selectedFilters.channel === channel.id}
                  onCheckedChange={(checked) => {
                    updateFilters('channel', checked ? channel.id : null)
                  }}
                />
                <Label htmlFor={channel.id}>{channel.name}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 材料类型 */}
      <AccordionItem value="material">
        <AccordionTrigger>材料类型</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {materials.map((material) => (
              <div key={material.id} className="flex items-center space-x-2">
                <Checkbox
                  id={material.id}
                  checked={selectedFilters.material === material.id}
                  onCheckedChange={(checked) => {
                    updateFilters('material', checked ? material.id : null)
                  }}
                />
                <Label htmlFor={material.id}>{material.name}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 用途类型 */}
      <AccordionItem value="utility">
        <AccordionTrigger>用途类型</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {utilities.map((utility) => (
              <div key={utility.id} className="flex items-center space-x-2">
                <Checkbox
                  id={utility.id}
                  checked={selectedFilters.utility === utility.id}
                  onCheckedChange={(checked) => {
                    updateFilters('utility', checked ? utility.id : null)
                  }}
                />
                <Label htmlFor={utility.id}>{utility.name}</Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 价格区间 */}
      <AccordionItem value="price">
        <AccordionTrigger>价格区间</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="最低价"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({
                  ...prev,
                  min: e.target.value
                }))}
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="最高价"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({
                  ...prev,
                  max: e.target.value
                }))}
              />
            </div>
            <Button 
              onClick={updatePriceRange}
              className="w-full"
            >
              确定
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
} 