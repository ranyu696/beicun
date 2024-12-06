import { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: '常见问题 - 杯村测评',
  description: '解答用户最常遇到的问题和疑惑',
}

const faqs = [
  {
    question: "如何选择适合自己的产品？",
    answer: "选择产品时需要考虑以下因素：1. 个人尺寸情况 2. 材质偏好（TPE较软，硅胶较韧） 3. 刺激程度（建议新手从低刺激开始） 4. 预算范围（建议选择知名品牌的正品） 5. 使用频率（频繁使用建议选择耐用材质）"
  },
  {
    question: "为什么一定要使用专用润滑液？",
    answer: "专用水溶性润滑液能够：1. 保护产品材质不受损坏 2. 提供适当的润滑度 3. 延长产品使用寿命 4. 避免细菌滋生 5. 防止产品变质。切勿使用其他替代品，可能导致产品损坏或卫生问题。"
  },
  {
    question: "如何正确清洗和保养？",
    answer: "正确的清洁步骤：1. 使用温水和专用清洁剂冲洗 2. 特别注意细节部位的清洁 3. 使用软毛巾轻轻擦拭 4. 自然晾干或使用专用干燥剂 5. 确保完全干燥后再收纳 6. 存放在阴凉干燥处，避免阳光直射"
  },
  {
    question: "使用时出现异味怎么办？",
    answer: "异味可能的原因：1. 清洁不彻底 2. 储存环境潮湿 3. 材质老化。解决方法：1. 使用专业清洁剂深度清洁 2. 确保完全干燥 3. 改善存储环境 4. 如果问题持续，建议更换新品"
  },
  {
    question: "材质发生变化是否正常？",
    answer: "材质可能随使用时间出现一些变化：1. 轻微变色属于正常现象 2. 表面轻微变化可接受 3. 但如出现明显变形、粘性增加或异味，应立即停止使用并考虑更换"
  },
  {
    question: "多久需要更换新品？",
    answer: "更换周期取决于：1. 使用频率 2. 保养情况 3. 储存环境。一般建议：1. 定期检查产品状态 2. 出现明显老化迹象时及时更换 3. 即使外观完好，也建议1-2年更换一次"
  },
  {
    question: "使用过程中有不适感怎么办？",
    answer: "如果出现不适：1. 立即停止使用 2. 检查是否因润滑不足 3. 确认产品是否清洁到位 4. 考虑是否选择了不合适的型号 5. 必要时咨询医生。建议首次使用时先适应一段时间"
  },
  {
    question: "可以和他人共用吗？",
    answer: "强烈不建议共用，原因如下：1. 存在卫生安全隐患 2. 可能传播细菌和疾病 3. 影响产品寿命 4. 违反产品使用规范。建议：每人使用专属产品，并妥善保管"
  },
  {
    question: "使用前需要做哪些准备？",
    answer: "使用前的准备工作：1. 检查产品完整性 2. 清洁消毒 3. 准备足量润滑液 4. 调节到合适温度 5. 确保环境私密安全 6. 做好个人卫生清洁"
  },
  {
    question: "如何判断产品是否需要报废？",
    answer: "以下情况建议报废：1. 材质出现明显劣化 2. 有难闻的异味无法去除 3. 清洗后仍有异常粘性 4. 出现裂痕或破损 5. 使用时感觉明显不适 6. 超过推荐使用期限"
  }
]

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-3xl font-bold">常见问题</h1>
        <p className="text-muted-foreground">
          解答用户最常遇到的问题和疑惑
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground text-center mb-0">
          如果您的问题没有得到解答，请联系客服获取更多帮助
        </p>
      </div>
    </div>
  )
}