import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
  } from '@react-email/components'
  import { Tailwind } from '@react-email/tailwind'
  
  interface ResetPasswordEmailProps {
    resetUrl: string
  }
  
  export default function ResetPasswordEmail({
    resetUrl,
  }: ResetPasswordEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>重置您的杯村账号密码</Preview>
        <Tailwind>
          <Body className="bg-white font-sans">
            <Container className="mx-auto py-8 px-4">
              <Heading className="text-2xl font-bold text-gray-900 text-center mb-4">
                重置密码
              </Heading>
              <Text className="text-gray-600 mb-4">
                我们收到了重置您杯村账号密码的请求。请点击下面的按钮重置密码：
              </Text>
              <Section className="text-center mb-8">
                <Button
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
                  href={resetUrl}
                >
                  重置密码
                </Button>
              </Section>
              <Text className="text-sm text-gray-500 mb-4">
                此链接将在1小时后失效。如果您没有请求重置密码，请忽略此邮件。
              </Text>
              <Hr className="border-gray-200 my-4" />
              <Text className="text-xs text-gray-400 text-center">
                © {new Date().getFullYear()} 杯村. 保留所有权利。
              </Text>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    )
  }