import { Metadata } from "next"

export const metadata: Metadata = {
  title: '清洁保养 - 杯村测评',
  description: '学习正确的清洁方法和日常保养技巧',
}

export default function MaintenanceTutorialPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>清洁保养</h1>
      <p className="lead">
        了解如何正确清洁和保养您的产品。
      </p>
      
      {/* 添加教程内容 */}
    </div>
  )
} 