import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, JapaneseYenIcon as Sake, Utensils, Coffee } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">探索日本名器的魅力</h2>
          <p className="text-xl text-gray-600 mb-8">深入了解日本传统工艺，品鉴顶级名器</p>
          <Button className="text-lg">开始探索</Button>
        </div>
      </section>

      {/* Latest Reviews Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">最新评测</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "有田烧茶碗", rating: 4.5, description: "精致的釉彩，完美展现了有田烧的特色。" },
              { title: "萩烧酒杯", rating: 4.8, description: "独特的质感，每次使用都是一种享受。" },
              { title: "京都漆器盘", rating: 4.7, description: "传统与现代的完美结合，艺术品级别的餐具。" }
            ].map((review, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{review.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{review.rating}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{review.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="hover:bg-gray-100">阅读完整评测</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">关于杯村</h3>
            <p className="text-gray-600 mb-8">
              杯村致力于为爱好者提供最全面、专业的日本名器评测。我们的团队由资深工艺品鉴赏家和茶道专家组成，
              为您带来最真实、深入的使用体验和专业点评。
            </p>
            <Button className="hover:bg-gray-100">了解更多</Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">探索名器类别</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "茶具", icon: <Coffee className="w-8 h-8" /> },
              { name: "酒具", icon: <Sake className="w-8 h-8" /> },
              { name: "餐具", icon: <Utensils className="w-8 h-8" /> },
              { name: "陶瓷", icon: <Star className="w-8 h-8" /> }
            ].map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                    {category.icon}
                  </div>
                  <h4 className="font-semibold">{category.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}