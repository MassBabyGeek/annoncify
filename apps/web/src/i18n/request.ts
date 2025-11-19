import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'fr']

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
