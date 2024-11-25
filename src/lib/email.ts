import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import VerificationEmail from '@/emails/verification-email'
import ResetPasswordEmail from '@/emails/reset-password-email'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  // 使用 await 等待 render 完成
  const emailHtml = await render(
    VerificationEmail({ verificationUrl })
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "验证您的杯村账号邮箱",
    html: emailHtml, // 现在 emailHtml 是 string 类型
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  // 使用 await 等待 render 完成
  const emailHtml = await render(
    ResetPasswordEmail({ resetUrl })
  )

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "重置您的杯村账号密码",
    html: emailHtml, // 现在 emailHtml 是 string 类型
  })
}