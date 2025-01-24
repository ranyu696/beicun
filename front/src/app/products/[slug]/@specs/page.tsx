import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { getProductBySlug } from "@/app/actions/products"

const levelMap = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  ULTRA_SOFT: '超软',
  SOFT: '软',
  HARD: '硬',
  ULTRA_HARD: '超硬',
  TIGHT: '紧',
  LOOSE: '松'
}

interface SpecsPageProps {
  params: {
    slug: string
  }
}

export default async function SpecsPage({ params }: SpecsPageProps) {
  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      notFound()
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>规格参数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 基本参数 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>基本参数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">产品类型</TableCell>
                  <TableCell>{product.productType?.name || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">材质</TableCell>
                  <TableCell>{product.materialType?.name || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">通道类型</TableCell>
                  <TableCell>{product.channelType?.name || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">版本</TableCell>
                  <TableCell>{product.version || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* 尺寸重量 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>尺寸重量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">总长度</TableCell>
                  <TableCell>{product.totalLength ? `${product.totalLength}mm` : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">通道长度</TableCell>
                  <TableCell>{product.channelLength ? `${product.channelLength}mm` : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">宽度</TableCell>
                  <TableCell>{product.width ? `${product.width}mm` : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">高度</TableCell>
                  <TableCell>{product.height ? `${product.height}mm` : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">重量</TableCell>
                  <TableCell>{product.weight ? `${product.weight}g` : '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* 使用体验 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>使用体验</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">刺激度</TableCell>
                  <TableCell>{product.stimulation ? levelMap[product.stimulation] : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">软硬度</TableCell>
                  <TableCell>{product.softness ? levelMap[product.softness] : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">紧度</TableCell>
                  <TableCell>{product.tightness ? levelMap[product.tightness] : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">气味</TableCell>
                  <TableCell>{product.smell ? levelMap[product.smell] : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">油性</TableCell>
                  <TableCell>{product.oiliness ? levelMap[product.oiliness] : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">耐用性</TableCell>
                  <TableCell>{product.durability ? levelMap[product.durability] : '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">可反转</TableCell>
                  <TableCell>{product.isReversible ? '是' : '否'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('获取产品规格失败:', error)
    notFound()
  }
}