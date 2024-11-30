"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type FilterOption = {
  id: string
  name: string
}

type FilterDialogProps = {
  brands: FilterOption[]
  utilityTypes: FilterOption[]
  materialTypes: FilterOption[]
  channelTypes: FilterOption[]
}

export function FilterDialog({
  brands,
  utilityTypes,
  materialTypes,
  channelTypes,
}: FilterDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [brand, setBrand] = useState(searchParams.get("brand") || "")
  const [utilityType, setUtilityType] = useState(searchParams.get("utilityType") || "")
  const [material, setMaterial] = useState(searchParams.get("material") || "")
  const [channelType, setChannelType] = useState(searchParams.get("channelType") || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (brand) params.set("brand", brand)
    if (utilityType) params.set("utilityType", utilityType)
    if (material) params.set("material", material)
    if (channelType) params.set("channelType", channelType)

    router.push(`/products?${params.toString()}`)
  }

  const handleReset = () => {
    setBrand("")
    setUtilityType("")
    setMaterial("")
    setChannelType("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          筛选
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>筛选条件</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>品牌</label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger>
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
          
          <div className="grid gap-2">
            <label>器具类型</label>
            <Select value={utilityType} onValueChange={setUtilityType}>
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
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

          <div className="grid gap-2">
            <label>材质</label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="选择材质" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label>通道种类</label>
            <Select value={channelType} onValueChange={setChannelType}>
              <SelectTrigger>
                <SelectValue placeholder="选择通道种类" />
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
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <Button onClick={handleFilter}>确定</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 