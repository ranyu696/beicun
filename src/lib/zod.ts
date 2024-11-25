import { object, string } from "zod"
 
export const signInSchema = object({
  email: string({ required_error: "电子邮件为必填项" })
    .min(1, "电子邮件为必填项")
    .email("电子邮件无效"),
  password: string({ required_error: "需要密码" })
    .min(1, "需要密码")
    .min(8, "密码必须大于8个字符")
    .max(32, "密码必须少于 32 个字符"),
})