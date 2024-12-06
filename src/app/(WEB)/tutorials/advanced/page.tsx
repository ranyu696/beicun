import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: '进阶教程 - 杯村测评',
  description: '深入了解进阶技巧和专业知识',
}

export default function AdvancedTutorialPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>进阶教程</h1>
      <p className="lead">
        深入了解更多专业知识和进阶技巧。本教程适合已经有一定使用经验的用户。
      </p>

      <h2>材质科普</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-8">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tutorials/material-tpe.jpg"
            alt="TPE材质示意图"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tutorials/material-silicone.jpg"
            alt="硅胶材质示意图"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <ul>
        <li>TPE材质的深度解析：
          <ul>
            <li>分子结构特点</li>
            <li>不同配方的差异</li>
            <li>使用寿命影响因素</li>
          </ul>
        </li>
        <li>硅胶材质的类型：
          <ul>
            <li>医用级硅胶特性</li>
            <li>不同硬度的应用</li>
            <li>耐久性测试结果</li>
          </ul>
        </li>
      </ul>

      <h2>结构设计原理</h2>
      <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
        <Image
          src="/images/tutorials/structure.jpg"
          alt="内部结构示意图"
          fill
          className="object-cover"
        />
      </div>
      <ul>
        <li>内部构造解析</li>
        <li>不同褶皱设计的效果</li>
        <li>压力分布原理</li>
        <li>材质分层技术</li>
      </ul>

      <h2>进阶使用技巧</h2>
      <ul>
        <li>温度调节：
          <ul>
            <li>最佳使用温度范围</li>
            <li>安全加温方法</li>
            <li>温度对体验的影响</li>
          </ul>
        </li>
        <li>润滑要点：
          <ul>
            <li>不同类型润滑液的特点</li>
            <li>用量与使用方法</li>
            <li>常见误区</li>
          </ul>
        </li>
      </ul>

      <h2>专业维护方法</h2>
      <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
        <Image
          src="/images/tutorials/maintenance.jpg"
          alt="维护步骤示意图"
          fill
          className="object-cover"
        />
      </div>
      <ul>
        <li>深度清洁技巧：
          <ul>
            <li>专业清洁工具介绍</li>
            <li>消毒方法对比</li>
            <li>特殊情况处理</li>
          </ul>
        </li>
        <li>保养要点：
          <ul>
            <li>材质保护方法</li>
            <li>存储环境控制</li>
            <li>定期维护计划</li>
          </ul>
        </li>
      </ul>

      <h2>产品寿命优化</h2>
      <ul>
        <li>影响寿命的关键因素</li>
        <li>最佳使用频率建议</li>
        <li>材质老化预防</li>
        <li>更换时机判断</li>
      </ul>

      <div className="bg-muted p-4 rounded-lg mt-8">
        <h3 className="mt-0">专业建议</h3>
        <ul className="mb-0">
          <li>定期检查产品状态</li>
          <li>保持合理使用频率</li>
          <li>出现异常及时处理</li>
          <li>不要过分追求刺激</li>
        </ul>
      </div>
    </div>
  )
} 