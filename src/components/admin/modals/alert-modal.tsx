"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  loading
}: AlertModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Modal
      title="确认操作"
      description="此操作不可撤销，是否继续？"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button 
          disabled={loading} 
          variant="outline" 
          onClick={onClose}
        >
          取消
        </Button>
        <Button 
          disabled={loading} 
          variant="destructive" 
          onClick={onConfirm}
        >
          确认
        </Button>
      </div>
    </Modal>
  )
} 