import { ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarMenuButtonProps {
  icon: ElementType
  label: string
  active?: boolean
  asChild?: boolean
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

export function SidebarMenuButton({
  icon: Icon,
  label,
  active,
  asChild,
  className,
  onClick,
  children,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Button : 'button'
  
  return (
    <Comp
      variant="ghost"
      className={cn(
        'w-full flex items-center gap-2 justify-start',
        active && 'bg-muted',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {label}
      {children}
    </Comp>
  )
}
