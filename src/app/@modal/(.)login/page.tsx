
import { LoginForm } from '@/components/auth/LoginForm' 
import { Modal } from '@/components/Modal'

export default function LoginModal() {
  return (
    <Modal>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <LoginForm />
      </div>
    </Modal>
  )
}