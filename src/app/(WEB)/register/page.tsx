import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <RegisterForm />
      </div>
    </div>
  )
}