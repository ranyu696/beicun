'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

// 定义产品类型
interface Product {
  id: string
  name: string
  mainImage: string
  price: number
  brand: {
    name: string
  }
  productType: {
    name: string
  }
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  // 获取产品列表
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('获取数据失败')
      const { data } = await response.json()
      setProducts(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "获取产品列表失败" + error
      })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  // 搜索处理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // 删除处理
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('删除失败')
      
      toast({
        title: "删除成功",
        description: "产品已删除"
      })
      
      fetchProducts() // 重新加载列表
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "请稍后重试" + error
      })
    }
  }

  // 初始加载
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // 过滤产品
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input 
          placeholder="搜索产品..." 
          className="max-w-xs"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>产品图片</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>品牌</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>价格</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image 
                      src={product.mainImage}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell>{product.productType.name}</TableCell>
                  <TableCell>¥{product.price}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}