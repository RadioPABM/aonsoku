import { InfoIcon } from 'lucide-react'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover'
import { Separator } from '@/app/components/ui/separator'
import { SimpleTooltip } from '@/app/components/ui/simple-tooltip'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { cn } from '@/lib/utils'

type SectionComponent = ComponentPropsWithoutRef<'div'>

export function Root({ children, className, ...props }: SectionComponent) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

export function Header({ children, className, ...props }: SectionComponent) {
  return (
    <div className={cn('w-full mb-4 space-y-2', className)} {...props}>
      {children}
    </div>
  )
}

export function HeaderTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-medium leading-none text-foreground">{children}</h3>
  )
}

export function HeaderDescription({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

export function Content({ children, className, ...props }: SectionComponent) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
}

export function ContentItem({
  children,
  className,
  ...props
}: SectionComponent) {
  return (
    <div
      className={cn('flex items-center space-between min-h-8', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface ContentItemTitleProps extends ComponentPropsWithoutRef<'span'> {
  info?: string
}

export function ContentItemTitle({
  info,
  className,
  children,
}: ContentItemTitleProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-1 items-center gap-1">
      <span className={cn('text-sm leading-none text-foreground', className)}>
        {children}
      </span>
      {info &&
        (isMobile ? <InfoPopover info={info} /> : <InfoTooltip info={info} />)}
    </div>
  )
}

const infoButtonStyle =
  'hover:bg-muted-foreground/20 rounded cursor-pointer text-foreground'

function InfoTooltip({ info }: { info: string }) {
  return (
    <SimpleTooltip text={info} delay={0}>
      <div
        className={cn(infoButtonStyle, 'p-1')}
        data-testid="settings-info-icon"
      >
        <InfoIcon className="w-3 h-3" />
      </div>
    </SimpleTooltip>
  )
}

/**
 * A tooltip needs a pointer that hovers, and SimpleTooltip renders nothing at
 * all without one. Touch gets a popover it can open, with a target big enough
 * to hit.
 */
function InfoPopover({ info }: { info: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(infoButtonStyle, 'p-2')}
          aria-label={info}
        >
          <InfoIcon className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 max-w-[calc(100vw-2rem)] p-3 text-sm font-normal"
      >
        {info}
      </PopoverContent>
    </Popover>
  )
}

export function ContentItemForm({
  children,
  className,
  ...props
}: SectionComponent) {
  return (
    <div
      className={cn('w-2/5 max-w-52 flex items-center justify-end', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function ContentSeparator({ className }: { className?: string }) {
  return <Separator className={cn('mt-4', className)} />
}
