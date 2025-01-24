import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface ProductBreadcrumbProps {
  brand: {
    name: string
  }
  productType: {
    name: string
  }
  product: {
    name: string
  }
}

export function ProductBreadcrumb({ brand, productType, product }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link 
        href="/" 
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href="/brands"
        className="hover:text-primary transition-colors"
      >
        品牌
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href={`/brands/${brand.name.toLowerCase()}`}
        className="hover:text-primary transition-colors"
      >
        {brand.name}
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href={`/categories/${productType.name.toLowerCase()}`}
        className="hover:text-primary transition-colors"
      >
        {productType.name}
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <span className="text-foreground font-medium">
        {product.name}
      </span>
    </nav>
  )
}