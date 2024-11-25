import { RegisterForm } from '@/components/auth/RegisterForm'
import { Modal } from '@/components/Modal'


export default function RegisterModal() {
  return (
    <Modal>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <RegisterForm />
      </div>
    </Modal>
  )
}