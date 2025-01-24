'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, History, X, ChevronDown } from "lucide-react"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "@/hooks/use-debounce"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  className?: string
}

type SearchType = 'all' | 'products' | 'reviews' | 'brands'

const searchTypeLabels: Record<SearchType, string> = {
  all: '全部',
  products: '产品',
  reviews: '测评',
  brands: '品牌'
}

export function SearchInput({ className }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [value, setValue] = useState("")
  const [searchType, setSearchType] = useState<SearchType>('all')
  const debouncedValue = useDebounce(value, 300)
  const [searchHistory, setSearchHistory] = useLocalStorage<Array<{
    term: string
    type: SearchType
  }>>("search-history", [])

  // 监听搜索参数变化
  useEffect(() => {
    const q = searchParams.get("q")
    const type = searchParams.get("type") as SearchType
    if (q) {
      setValue(q)
    }
    if (type && Object.keys(searchTypeLabels).includes(type)) {
      setSearchType(type)
    }
  }, [searchParams])

  // 处理搜索
  const handleSearch = (term: string, type: SearchType = searchType) => {
    if (!term.trim()) return

    // 更新搜索历史
    const newHistory = [
      { term, type },
      ...searchHistory.filter(item => item.term !== term)
    ].slice(0, 5)
    setSearchHistory(newHistory)

    // 执行搜索
    const params = new URLSearchParams(searchParams.toString())
    params.set("q", term)
    params.set("type", type)
    params.delete("page")
    router.push(`/search?${params.toString()}`)
    setSearchOpen(false)
  }

  // 清除搜索历史
  const clearHistory = () => {
    setSearchHistory([])
  }

  // 删除单个历史记录
  const removeHistoryItem = (term: string) => {
    setSearchHistory(prev => prev.filter(item => item.term !== term))
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value) {
      e.preventDefault()
      handleSearch(value)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={typeOpen}
              className="w-[120px] justify-between"
            >
              {searchTypeLabels[searchType]}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[120px] p-0">
          <Command>
  <CommandList key="search-type-list">
    <CommandGroup key="search-type-group">
      {Object.entries(searchTypeLabels).map(([type, label], index) => (
        <CommandItem
          key={`search-type-${type}-${index}`}
          onSelect={() => {
            setSearchType(type as SearchType)
            setTypeOpen(false)
            if (debouncedValue) {
              handleSearch(debouncedValue, type as SearchType)
            }
          }}
          className="justify-between"
        >
          {label}
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</Command>
          </PopoverContent>
        </Popover>

        <div className="relative flex-1">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`搜索${searchTypeLabels[searchType]}...`}
                  className={cn("pl-8", className)}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {value && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 px-0"
                    onClick={() => {
                      setValue("")
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete("q")
                      router.push(`/search?${params.toString()}`)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
            <Command>
  <CommandList key="search-history-list">
    <CommandEmpty key="empty-state">未找到相关结果</CommandEmpty>
    {searchHistory.length > 0 && (
      <CommandGroup key="history-group" heading="搜索历史">
        {searchHistory.map(({ term, type }, index) => (
          <CommandItem
            key={`history-${term}-${index}`}
            onSelect={() => handleSearch(term, type)}
            className="flex items-center justify-between"
          >
            {/* ... rest of the content ... */}
          </CommandItem>
        ))}
        <CommandSeparator key="history-separator" />
        <CommandItem 
          key="clear-history-action"
          onSelect={clearHistory}
          className="justify-center text-muted-foreground"
        >
          清除搜索历史
        </CommandItem>
      </CommandGroup>
    )}
  </CommandList>
</Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}