
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const reviews = [
  {
    id: "1",
    title: "测评标题",
    author: "作者名",
    product: "产品名称",
    status: "published",
    date: "2024-03-20"
  },
  // ... 更多测评数据
]

export function RecentReviews() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标题</TableHead>
          <TableHead>作者</TableHead>
          <TableHead>产品</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>发布日期</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews.map((review) => (
          <TableRow key={review.id}>
            <TableCell>{review.title}</TableCell>
            <TableCell>{review.author}</TableCell>
            <TableCell>{review.product}</TableCell>
            <TableCell>
              <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                {review.status === 'published' ? '已发布' : '草稿'}
              </Badge>
            </TableCell>
            <TableCell>{review.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}