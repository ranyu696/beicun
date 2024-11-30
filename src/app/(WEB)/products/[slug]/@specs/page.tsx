import { prisma } from "@/lib/prisma"
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

type Params = Promise<{ slug: string }>
export default async function SpecsPage({ params }: { params: Params }) {
  const {slug }= await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      materialType: true,
      channelType: true,
      productType: true,
    }
  })

  if (!product) notFound()

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
                <TableCell>{product.productType.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">材质类型</TableCell>
                <TableCell>
                  {product.materialType.name}
                  {product.materialType.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.materialType.description}
                    </p>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">通道类型</TableCell>
                <TableCell>
                  {product.channelType.name}
                  {product.channelType.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.channelType.description}
                    </p>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">版本</TableCell>
                <TableCell>{product.version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">可翻洗</TableCell>
                <TableCell>{product.isReversible ? '是' : '否'}</TableCell>
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
                <TableCell className="font-medium">高度</TableCell>
                <TableCell>{product.height}mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">宽度</TableCell>
                <TableCell>{product.width}mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">长度</TableCell>
                <TableCell>{product.length}mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">通道长度</TableCell>
                <TableCell>{product.channelLength}mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">整体长度</TableCell>
                <TableCell>{product.totalLength}mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">重量</TableCell>
                <TableCell>{product.weight}g</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* 产品特性 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2}>产品特性</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">刺激度</TableCell>
                <TableCell>{levelMap[product.stimulation]}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">软硬度</TableCell>
                <TableCell>{levelMap[product.softness]}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">紧致度</TableCell>
                <TableCell>{levelMap[product.tightness]}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">气味度</TableCell>
                <TableCell>{levelMap[product.smell]}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">出油量</TableCell>
                <TableCell>{levelMap[product.oiliness]}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}