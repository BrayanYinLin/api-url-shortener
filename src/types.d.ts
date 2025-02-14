import { z } from 'zod'
import { provider, user } from './models/user.model'
import { link } from './models/link.model'
import { Pool } from 'pg'
import { SupabaseClient } from '@supabase/supabase-js'

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

export interface Repository {
  database: Pool | SupabaseClient
  findUserById({ id }: Required<Pick<User, 'id'>>): Promise<User>
  findUserByEmail({ email }: Pick<User, 'email'>): Promise<User | null>
  createUser({
    provider: { provider_name },
    name,
    avatar,
    email
  }: User): Promise<User>
  findEveryLinksByUser({ id }: Required<Pick<User, 'id'>>): Promise<Link[]>
  findLinkbyShort({ short }: Pick<Link, 'short'>): Promise<Link | null>
}
