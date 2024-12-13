
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"



interface ProductLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
  content: React.ReactNode
  specs: React.ReactNode
  reviews: React.ReactNode
  ratings: React.ReactNode
}

export default function ProductLayout({
  children,
  modal,
  content,
  specs,
  reviews,
  ratings,
}: ProductLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* 主要内容区域 */}
      <div className="space-y-6">
        {children}
      <Tabs defaultValue="content" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="content">产品介绍</TabsTrigger>
        <TabsTrigger value="specs">规格参数</TabsTrigger>
        <TabsTrigger value="reviews">用户评测</TabsTrigger>
        <TabsTrigger value="ratings">用户评分</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        {content}
      </TabsContent>

      <TabsContent value="specs" className="space-y-4">
        {specs}
      </TabsContent>

      <TabsContent value="reviews" className="space-y-4">
        {reviews}
      </TabsContent>

      <TabsContent value="ratings" className="space-y-4">
        {ratings}
      </TabsContent>
    </Tabs>
      </div>

      {/* 模态框 */}
      {modal}
    </div>
  )
}