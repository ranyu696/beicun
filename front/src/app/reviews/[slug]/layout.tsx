export default function ReviewLayout({
    children,
    product,
    comments
  }: {
    children: React.ReactNode
    product: React.ReactNode
    comments: React.ReactNode
  }) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* 主内容区域 - 测评和评论 */}
          <div className="col-span-2 space-y-6">
            {children}
            {comments}
          </div>
          
          {/* 右侧产品信息 */}
          <div className="col-span-1">
            {product}
          </div>
        </div>
      </div>
    )
  }