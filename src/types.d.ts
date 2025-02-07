import { z } from 'zod'
import { provider, user } from './models/user.model'
import { link } from './models/link.model'

type User = z.infer<typeof user>
type UserJWT = Pick<User, 'id' | 'email' | 'name' | 'created_at'>

type Provider = z.infer<typeof provider>
type Link = z.infer<typeof link>

declare global {
  namespace Express {
    interface Request {
      user?: User | UserJWT
    }
  }
}

export type GoogleUser = {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}
