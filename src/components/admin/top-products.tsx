import { Avatar } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"

const products = [
  {
    name: "产品A",
    views: 1234,
    conversion: "4.2%",
    image: "/placeholder.jpg"
  },
  // ... 更多产品数据
]

export function TopProducts() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>产品</TableHead>
          <TableHead className="text-right">浏览量</TableHead>
          <TableHead className="text-right">转化率</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.name}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <Image src={product.image} alt={product.name} width={32} height={32} />
                </Avatar>
                {product.name}
              </div>
            </TableCell>
            <TableCell className="text-right">{product.views}</TableCell>
            <TableCell className="text-right">{product.conversion}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}