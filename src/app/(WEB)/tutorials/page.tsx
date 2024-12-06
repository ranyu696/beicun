import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Book, BookOpen, Sparkles, HelpCircle } from "lucide-react"

const tutorials = [
  {
    title: "新手指南",
    href: "/tutorials/beginner",
    description: "适合新手的入门教程，包含基础知识和使用技巧。",
    icon: Book
  },
  {
    title: "进阶教程",
    href: "/tutorials/advanced",
    description: "深入了解进阶技巧和专业知识。",
    icon: Sparkles
  },
  {
    title: "清洁保养",
    href: "/tutorials/maintenance",
    description: "学习正确的清洁方法和日常保养技巧。",
    icon: BookOpen
  },
  {
    title: "常见问题",
    href: "/tutorials/faq",
    description: "解答用户最常遇到的问题和疑惑。",
    icon: HelpCircle
  }
]

export default function TutorialsPage() {
  return (
    <>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">教程中心</h1>
        <p className="text-muted-foreground">
          探索我们的教程和指南，帮助您更��地使用和维护产品
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon
          return (
            <Link key={tutorial.href} href={tutorial.href} className="group">
              <Card className="h-full transition-all duration-300 group-hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {tutorial.title}
                  </CardTitle>
                  <CardDescription>
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </>
  )
} 