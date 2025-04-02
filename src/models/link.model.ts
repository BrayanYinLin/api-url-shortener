import { z } from 'zod'
import { Link } from '../types'

const link = z.object({
  id: z.string().uuid().nonempty().optional(),
  long: z.string().url(),
  short: z.string(),
  clicks: z.number().int().min(0).optional(),
  created_at: z.string().datetime().optional(),
  expires_at: z.string().datetime({ offset: true }).nullable().optional()
})

const updateSchema = z.object({
  id: z.string().uuid().nonempty(),
  long: z.string().url()
})

const checkLink = (linkToCheck: Link) => {
  return link.safeParse(linkToCheck)
}

const checkUpdateLink = (linkToCheck: Required<Pick<Link, 'id' | 'long'>>) => {
  return updateSchema.safeParse(linkToCheck)
}

export { link, checkLink, checkUpdateLink }
