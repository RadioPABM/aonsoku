import { useTranslation } from 'react-i18next'
import { Link, useRouteError } from 'react-router-dom'
import { Button } from '@/app/components/ui/button'
import { ROUTES } from '@/routes/routesList'

interface IError {
  status?: number
  statusText?: string
  internal?: boolean
  data?: string
}

export default function ErrorPage({ status, statusText }: IError) {
  const { t } = useTranslation()
  const error = useRouteError() as IError

  const statusCode = error?.status ?? status
  const defaultDescription =
    statusCode === 404 ? t('error.notFound') : t('error.unhandled')

  return (
    <div className="w-full h-mobile-content md:h-content flex flex-col justify-center items-center px-4">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        {t('error.title')}
      </h1>

      <p className="leading-7 text-left mt-6">
        {t('error.statusCode')}:{' '}
        <strong className="font-semibold">
          {statusCode ?? t('error.none')}
        </strong>
      </p>
      <p className="leading-7 mt-2 text-left">
        {t('error.description')}:{' '}
        <strong className="font-semibold">
          {error?.data ?? statusText ?? defaultDescription}
        </strong>
      </p>

      <Link to={ROUTES.LIBRARY.HOME}>
        <Button className="mt-6">{t('error.backToHome')}</Button>
      </Link>
    </div>
  )
}
