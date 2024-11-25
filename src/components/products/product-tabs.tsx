import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductTabsProps {
  contentTab: React.ReactNode
  specsTab: React.ReactNode
  reviewsTab: React.ReactNode
  ratingsTab: React.ReactNode
}

export function ProductTabs({ 
  contentTab,
  specsTab,
  reviewsTab,
  ratingsTab 
}: ProductTabsProps) {
  return (
    <Tabs defaultValue="content" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="content">产品介绍</TabsTrigger>
        <TabsTrigger value="specs">规格参数</TabsTrigger>
        <TabsTrigger value="reviews">用户评测</TabsTrigger>
        <TabsTrigger value="ratings">用户评分</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        {contentTab}
      </TabsContent>

      <TabsContent value="specs" className="space-y-4">
        {specsTab}
      </TabsContent>

      <TabsContent value="reviews" className="space-y-4">
        {reviewsTab}
      </TabsContent>

      <TabsContent value="ratings" className="space-y-4">
        {ratingsTab}
      </TabsContent>
    </Tabs>
  )
}