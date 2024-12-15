"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowDownNarrowWide, 
  ArrowUpNarrowWide,
  Clock,
  SortAsc,
  SortDesc
} from "lucide-react"

interface ProductSortProps {
  sort?: string
}

const sortOptions = [
  { value: 'newest', label: '最新上架', icon: Clock },
  { value: 'priceAsc', label: '价格从低到高', icon: ArrowUpNarrowWide },
  { value: 'priceDesc', label: '价格从高到低', icon: ArrowDownNarrowWide },
  { value: 'nameAsc', label: '名称A-Z', icon: SortAsc },
  { value: 'nameDesc', label: '名称Z-A', icon: SortDesc },
]

export function ProductSort({ sort = 'newest' }: ProductSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page')
    router.push(`/search?${params.toString()}`)
  }

  return (
    <Select value={sort} onValueChange={updateSort}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="排序方式" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map(option => {
          const Icon = option.icon
          return (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
} 