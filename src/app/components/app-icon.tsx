import { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type AppIconProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> & {
  size?: number
}

export function AppIcon({ size = 32, className, ...props }: AppIconProps) {
  return (
    <img
      src="icon.svg"
      height={size}
      width={size}
      alt="radioPABM"
      className={cn('select-none', className)}
      {...props}
    />
  )
}
