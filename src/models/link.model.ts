import { z } from 'zod'
import { Link } from '../types'

const link = z.object({
  id: z.string().uuid().nonempty().optional(),
  long: z.string().url(),
  short: z.string(),
  clicks: z.number().int().min(0).optional(),
  created_at: z.string().datetime().optional()
})

const checkLink = (linkToCheck: Link) => {
  return link.safeParse(linkToCheck)
}

const checkUpdateLink = (linkToCheck: Link) => {
  return link
    .omit({
      created_at: true
    })
    .required({
      id: true
    })
    .safeParse(linkToCheck)
}

export { link, checkLink, checkUpdateLink }
