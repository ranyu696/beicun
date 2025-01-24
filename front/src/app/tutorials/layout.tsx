import { Metadata } from "next"

export const metadata: Metadata = {
  title: '教程中心 - 杯村测评',
  description: '探索杯村的教程和指南',
}

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
} 