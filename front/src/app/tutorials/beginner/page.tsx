import { Metadata } from "next"

export const metadata: Metadata = {
  title: '新手指南 - 杯村测评',
  description: '适合新手的入门教程，包含基础知识和使用技巧',
}

export default function BeginnerTutorialPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>新手指南</h1>
      <p className="lead">
        欢迎来到杯村！这篇指南将帮助您了解基础知识和使用技巧。
      </p>

      <h2>选购建议</h2>
      <p>
        初次选购时，建议从以下几个方面考虑：
      </p>
      <ul>
        <li>材质：TPE和硅胶是最常见的两种材质，各有特点：
          <ul>
            <li>TPE：柔软度高，触感真实，但需要更多维护</li>
            <li>硅胶：耐用性好，易于清洁，但硬度较高</li>
          </ul>
        </li>
        <li>尺寸：根据个人情况选择合适的尺寸，避免过大或过小</li>
        <li>刺激度：建议新手从低刺激或中等刺激开始尝试</li>
        <li>价格：建议选择知名品牌的入门级产品，价格适中即可</li>
      </ul>

      <h2>使用准备</h2>
      <ul>
        <li>使用前请仔细阅读说明书</li>
        <li>准备必要的辅助用品：
          <ul>
            <li>专用润滑液</li>
            <li>清洁剂</li>
            <li>干燥剂</li>
            <li>收纳袋</li>
          </ul>
        </li>
        <li>使用前将产品回温至适宜温度</li>
        <li>确保环境私密、安全</li>
      </ul>

      <h2>使用注意事项</h2>
      <ul>
        <li>必须使用专用水溶性润滑液</li>
        <li>动作要轻柔，避免用力过猛</li>
        <li>注意使用时间，不宜过长</li>
        <li>如有不适感要立即停止使用</li>
      </ul>

      <h2>基础维护</h2>
      <ul>
        <li>每次使用后及时清洁</li>
        <li>使用温水和专用清洁剂清洗</li>
        <li>完全晾干后再收纳</li>
        <li>存放在阴凉干燥处</li>
        <li>定期检查产品是否有损坏</li>
      </ul>

      <div className="bg-muted p-4 rounded-lg mt-8">
        <h3 className="mt-0">温馨提示</h3>
        <ul className="mb-0">
          <li>保持良好的个人卫生习惯</li>
          <li>适度使用，注意身体健康</li>
          <li>如有疑问请咨询客服</li>
        </ul>
      </div>
    </div>
  )
} 