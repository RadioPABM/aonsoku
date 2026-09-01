import { XIcon } from 'lucide-react'
import { ToastContainer as Container, toast } from 'react-toastify'
import { Button } from '@/app/components/ui/button'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { toastColors } from '@/utils/toastColors'

export function ToastContainer() {
  const isMobile = useIsMobile()

  const container = (
    <Container
      toastClassName={(context) => {
        const type = context?.type === 'error' ? 'error' : 'default'

        return cn(
          toastColors[type],
          'flex font-sans rounded-md justify-between shadow-md overflow-hidden',
          // Shorter on a phone, where the message is the only thing worth the
          // space it takes from what is behind it.
          'min-h-0 md:min-h-toast',
        )
      }}
      bodyClassName="flex block p-2 text-xs md:p-3 md:text-sm"
      // react-toastify leaves this out of its defaults, so without it a toast
      // ignores taps entirely.
      closeOnClick={isMobile}
      pauseOnHover={false}
      pauseOnFocusLoss={false}
      position="top-center"
      stacked={true}
      newestOnTop={true}
      autoClose={5000}
      closeButton={
        isMobile
          ? false
          : (props) => (
              <Button
                variant="link"
                size="icon"
                onClick={props.closeToast}
                aria-label={props.ariaLabel}
                className="w-6 h-6"
              >
                <XIcon className="w-4 h-4 text-foreground" />
              </Button>
            )
      }
    />
  )

  if (!isMobile) return container

  // react-toastify ships no default for closeOnClick and does not act on the
  // prop here, so the dismissal is wired from the outside: a tap anywhere on
  // a toast bubbles up to this wrapper. There is no close button on touch,
  // and the tap is the only way to be rid of a message early.
  return <div onClick={() => toast.dismiss()}>{container}</div>
}
