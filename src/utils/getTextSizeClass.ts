export function getTextSizeClass(text: string) {
  const base = (value: string) => `${value} text-balance align-baseline`

  if (text.length < 15) {
    return base(
      'text-3xl leading-9 md:text-6xl md:leading-[4.75rem] 2xl:text-7xl 2xl:leading-[5.625rem]',
    )
  }

  if (text.length > 40) {
    return base(
      'text-xl leading-7 md:text-3xl md:leading-[2.65rem] 2xl:text-5xl 2xl:leading-[4rem]',
    )
  }

  return base(
    'text-2xl leading-8 md:text-4xl md:leading-[3rem] 2xl:text-6xl 2xl:leading-[5rem]',
  )
}
