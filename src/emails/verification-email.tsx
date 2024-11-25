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
  
  interface VerificationEmailProps {
    verificationUrl: string
  }
  
  export default function VerificationEmail({
    verificationUrl,
  }: VerificationEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>验证您的杯村账号邮箱</Preview>
        <Tailwind>
          <Body className="bg-white font-sans">
            <Container className="mx-auto py-8 px-4">
              <Heading className="text-2xl font-bold text-gray-900 text-center mb-4">
                欢迎加入杯村
              </Heading>
              <Text className="text-gray-600 mb-4">
                感谢您注册杯村账号。请点击下面的按钮验证您的邮箱地址：
              </Text>
              <Section className="text-center mb-8">
                <Button
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium"
                  href={verificationUrl}
                >
                  验证邮箱
                </Button>
              </Section>
              <Text className="text-sm text-gray-500 mb-4">
                如果您没有注册杯村账号，请忽略此邮件。
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