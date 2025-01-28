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

export type GoogleTokenPayload = {
  iss: string // Issuer
  azp: string // Authorized party
  aud: string // Audience
  sub: string // Subject (user ID)
  email: string // User email
  email_verified: boolean // Email verification status
  nbf: number // Not Before (timestamp)
  name: string // Full name of the user
  picture: string // URL of the user's profile picture
  given_name: string // First name
  family_name: string // Last name
  iat: number // Issued At (timestamp)
  exp: number // Expiration time (timestamp)
  jti: string // JWT ID (unique identifier for the token)
}
