import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_PROJECT_URL } from '../lib/enviroment'
import { Link, Repository, User } from '../types'
import {
  Database,
  SupabaseProvider,
  SupabaseViewLink,
  SupabaseViewLinkPerUser,
  SupabaseViewUser
} from '../database'
import { DataNotFound, LinkNotFound, UserNotFound } from '../lib/errors'

class Supabase implements Repository {
  static instance: Supabase
  database!: SupabaseClient

  constructor() {
    if (!Supabase.instance) {
      this.database = createClient<Database>(
        SUPABASE_PROJECT_URL!,
        SUPABASE_KEY!
      )

      Supabase.instance = this
    }

    return Supabase.instance
  }

  async findUserById({ id }: Required<Pick<User, 'id'>>): Promise<User> {
    const { data } = await this.database
      .from('vw_user')
      .select()
      .eq('id', id)
      .returns<SupabaseViewUser[]>()

    if (!data) {
      throw new UserNotFound('User not found by identifier')
    }

    const user = data[0]

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: {
        provider_id: Number(user.provider_id),
        provider_name: user.provider_name
      },
      created_at: user.created_at
    }
  }

  async findUserByEmail({ email }: Pick<User, 'email'>): Promise<User | null> {
    const { data } = await this.database
      .from('vw_user')
      .select()
      .eq('email', email)
      .returns<SupabaseViewUser[]>()

    if (!data) {
      throw new UserNotFound('User not found by identifier')
    }

    const user = data[0]

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: {
        provider_id: Number(user.provider_id),
        provider_name: user.provider_name
      },
      created_at: user.created_at
    }
  }

  async createUser({
    provider: { provider_name },
    name,
    avatar,
    email
  }: User): Promise<User> {
    const { data: providers } = await this.database
      .from('tb_provider')
      .select('provider_id')
      .eq('provider_name', provider_name)
      .returns<SupabaseProvider[]>()

    if (!providers) {
      throw new DataNotFound('Provider was not found')
    }

    const { provider_id } = providers[0]

    const { data: newUser } = await this.database
      .from('tb_users')
      .insert({
        user_name: name,
        user_email: email,
        user_avatar: avatar,
        provider_id: provider_id
      })
      .select()

    if (!newUser) {
      throw new UserNotFound('User was not created')
    }

    const { data } = await this.database
      .from('vw_user')
      .select()
      .eq('id', newUser[0].user_id)
      .returns<SupabaseViewUser[]>()

    if (!data) {
      throw new UserNotFound('User not found by identifier')
    }

    const user = data[0]

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: {
        provider_id: Number(user.provider_id),
        provider_name: user.provider_name
      },
      created_at: user.created_at
    }
  }

  async findEveryLinksByUser({
    id
  }: Required<Pick<User, 'id'>>): Promise<Link[]> {
    const { data } = await this.database
      .from('vw_link_per_user')
      .select()
      .eq('user_id', id)
      .returns<SupabaseViewLinkPerUser[]>()

    if (!data) {
      throw new DataNotFound('Links per user were not found')
    }

    return data.map(
      ({ link_id, long, short, clicks, created_at }): Link => ({
        id: String(link_id),
        long,
        short,
        clicks,
        created_at
      })
    )
  }

  async findLinkbyShort({ short }: Pick<Link, 'short'>): Promise<Link | null> {
    const { data } = await this.database
      .from('vw_link')
      .select()
      .eq('short', short)
      .returns<SupabaseViewLink[]>()

    if (!data) {
      throw new LinkNotFound('Link was not found')
    }

    const link = data[0]

    return link
  }
}

export { Supabase }
