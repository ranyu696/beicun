
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
        <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">产品介绍</TabsTrigger>
          <TabsTrigger value="specs">规格参数</TabsTrigger>
          <TabsTrigger value="reviews">用户评测</TabsTrigger>
          <TabsTrigger value="ratings">用户评分</TabsTrigger>
        </TabsList>

        <TabsContent value="content">{content}</TabsContent>
        <TabsContent value="specs">{specs}</TabsContent>
        <TabsContent value="reviews">{reviews}</TabsContent>
        <TabsContent value="ratings">{ratings}</TabsContent>
        </Tabs>
      </div>

      {/* 模态框 */}
      {modal}
    </div>
  )
}