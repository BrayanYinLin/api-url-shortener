import { z } from 'zod'
import { User } from '../types'

const provider = z.object({
  provider_id: z.number().int().optional(),
  provider_name: z.string().nonempty()
})

const user = z.object({
  id: z.string().uuid().nonempty().optional(),
  name: z.string().nonempty(),
  email: z.string().email(),
  avatar: z.string().url(),
  provider: provider,
  created_at: z.string().datetime().optional()
})

const checkUser = (userToCheck: User) => {
  return user.safeParse(userToCheck)
}

export { user, provider, checkUser }
