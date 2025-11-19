import { z } from 'zod'

export const ListingSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().default('EUR'),
  images: z.array(z.string()),
  externalId: z.string().optional(),
  externalUrl: z.string().optional(),
  category: z.string().optional(),
})

export type ScrapedListing = z.infer<typeof ListingSchema>

export interface ScraperResult {
  success: boolean
  listings: ScrapedListing[]
  errors: string[]
}

export interface BaseScraper {
  import(userId: string, credentials?: any): Promise<ScraperResult>
  validate(credentials?: any): Promise<boolean>
}
