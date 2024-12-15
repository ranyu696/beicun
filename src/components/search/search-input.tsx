"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, History, X } from "lucide-react"
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDebounce } from "@/hooks/use-debounce"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface SearchInputProps {
  className?: string
}

export function SearchInput({ className }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const debouncedValue = useDebounce(value, 300)
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>("search-history", [])

  // 监听搜索参数变化
  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setValue(q)
    }
  }, [searchParams])

  // 处理搜索
  const handleSearch = (term: string) => {
    if (!term.trim()) return

    // 更新搜索历史
    const newHistory = [
      term,
      ...searchHistory.filter(item => item !== term)
    ].slice(0, 5)
    setSearchHistory(newHistory)

    // 执行搜索
    const params = new URLSearchParams(searchParams.toString())
    params.set("q", term)
    params.delete("page")
    router.push(`/search?${params.toString()}`)
    setOpen(false)
  }

  // 清除搜索历史
  const clearHistory = () => {
    setSearchHistory([])
  }

  // 删除单个历史记录
  const removeHistoryItem = (term: string) => {
    setSearchHistory(prev => prev.filter(item => item !== term))
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch(value)
    }
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索名器..."
          className={`pl-8 ${className}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
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

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="搜索名器..." 
          value={value}
          onValueChange={setValue}
          onKeyDown={handleKeyDown}
          aria-labelledby="search-dialog-title"
        />
        
        <CommandList>
          <CommandEmpty>未找到相关结果</CommandEmpty>
          {searchHistory.length > 0 && (
            <CommandGroup heading="搜索历史">
              {searchHistory.map((term) => (
                <CommandItem
                  key={term}
                  onSelect={() => handleSearch(term)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    {term}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeHistoryItem(term)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CommandItem>
              ))}
              <CommandItem 
                onSelect={clearHistory}
                className="justify-center text-muted-foreground"
              >
                清除搜索历史
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
} 