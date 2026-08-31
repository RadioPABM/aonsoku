import { Skeleton } from '@/app/components/ui/skeleton'

export function HeaderFallback() {
  return (
    <div className="flex w-full bg-skeleton h-[190px] md:h-[250px] 2xl:h-[300px] px-4 md:px-8 py-4 md:py-6 gap-3 md:gap-4">
      <Skeleton className="bg-background/50 h-full aspect-square rounded-lg" />
      <div className="flex flex-col gap-3 w-full min-w-0 h-full justify-end">
        <Skeleton className="w-full max-w-96 h-8 md:h-10 bg-background/50" />
        <Skeleton className="w-2/3 max-w-60 h-5 md:h-6 bg-background/50" />

        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 bg-background/50 rounded-full" />
          <Skeleton className="w-16 h-6 bg-background/50 rounded-full" />
          <Skeleton className="w-16 h-6 bg-background/50 rounded-full" />
        </div>
      </div>
      <div className="hidden md:flex gap-2 h-full items-end">
        <Skeleton className="w-8 h-8 bg-background/50 rounded-full" />
        <Skeleton className="w-8 h-8 bg-background/50 rounded-full" />
      </div>
    </div>
  )
}

export function HomeFallback() {
  return (
    <div className="w-full">
      <HeaderFallback />

      <div className="px-4 md:px-8 pb-6">
        <PreviewListFallback />
        <PreviewListFallback />
        <PreviewListFallback />
        <PreviewListFallback />
      </div>
    </div>
  )
}

export function PreviewListFallback() {
  return (
    <div className="w-full flex flex-col my-4">
      <div className="flex justify-between my-4">
        <Skeleton className="w-40 md:w-52 h-7 md:h-8 rounded" />
        <div className="hidden md:flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      <SongsCarouselFallback />
    </div>
  )
}

export function SongsCarouselFallback() {
  return (
    <>
      <div className="flex md:hidden gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div className="basis-1/2" key={'mobile-' + index}>
            <Skeleton className="aspect-square" />
            <Skeleton className="h-[13px] w-11/12 mt-2" />
            <Skeleton className="h-3 w-1/2 mt-[7px]" />
          </div>
        ))}
      </div>

      <div className="hidden 2xl:flex gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="basis-1/8" key={'large-' + index}>
            <Skeleton className="aspect-square" />
            <Skeleton className="h-[13px] w-11/12 mt-2" />
            <Skeleton className="h-3 w-1/2 mt-[7px]" />
          </div>
        ))}
      </div>

      <div className="hidden md:flex 2xl:hidden gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="basis-1/5" key={'small-' + index}>
            <Skeleton className="aspect-square" />
            <Skeleton className="h-[13px] w-11/12 mt-2" />
            <Skeleton className="h-3 w-1/2 mt-[7px]" />
          </div>
        ))}
      </div>
    </>
  )
}
