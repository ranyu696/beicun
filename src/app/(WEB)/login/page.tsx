import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <LoginForm />
      </div>
    </div>
  )
}