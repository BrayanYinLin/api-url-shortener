import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_PROJECT_URL } from '../lib/enviroment'
import {
  EliminationType,
  Link,
  Repository,
  SupabaseTableLink,
  SupabaseTableUsers,
  User
} from '../types'
import {
  SupabaseProvider,
  SupabaseViewLink,
  SupabaseViewLinkPerUser,
  SupabaseViewUser
} from '../types'
import { Database } from '../database'
import { NotFoundError, OperationError } from '../lib/errors'

class Supabase implements Repository<SupabaseClient> {
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

    if (!data || data.length === 0) {
      throw new NotFoundError('User not found by identifier')
    }

    const [user] = data

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

    if (!data || data.length === 0) {
      return null
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

    if (!providers || providers.length === 0) {
      throw new NotFoundError('Provider was not found')
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
      .returns<SupabaseTableUsers[]>()

    if (!newUser) {
      throw new OperationError('User was not created')
    }

    const { data } = await this.database
      .from('vw_user')
      .select()
      .eq('id', newUser[0].user_id)
      .returns<SupabaseViewUser[]>()

    if (!data) {
      throw new OperationError('User not found by identifier')
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

    if (!data || data.length === 0) {
      return []
    }

    return data.map(
      ({ link_id, long, short, clicks, created_at, expires_at }): Link => ({
        id: String(link_id),
        long,
        short,
        clicks,
        created_at,
        expires_at
      })
    )
  }

  async findLinkbyShort({ short }: Pick<Link, 'short'>): Promise<Link | null> {
    const { data } = await this.database
      .from('vw_link')
      .select()
      .eq('short', short)
      .returns<SupabaseViewLink[]>()

    if (!data || data.length === 0) {
      return null
    }

    const link = data[0]

    return link
  }

  async createLink(
    { long, short, expires_at }: Pick<Link, 'long' | 'short' | 'expires_at'>,
    { id }: Required<Pick<User, 'id'>>
  ): Promise<Link> {
    const { data: links } = await this.database
      .from('tb_link')
      .insert({
        link_long: long,
        link_short: short,
        link_expires_at: expires_at
      })
      .select()
      .returns<SupabaseTableLink[]>()

    if (!links || links.length == 0) {
      throw new OperationError('Link was not created')
    }

    const { link_id } = links[0]

    await this.database
      .from('tb_link_per_user')
      .insert({ link_id: link_id, user_id: id })

    const { data } = await this.database
      .from('vw_link')
      .select()
      .eq('id', link_id)
      .returns<SupabaseViewLink[]>()

    if (!data || data.length === 0) {
      throw new NotFoundError('New link was not found')
    }

    const link = data[0]

    return link
  }

  async editLink({
    id,
    long
  }: Required<Pick<Link, 'id' | 'long'>>): Promise<Link> {
    const { status } = await this.database
      .from('tb_link')
      .update({ link_long: long })
      .eq('link_id', id)

    if (status !== 204) {
      throw new OperationError('Link was not updated')
    }

    const { data } = await this.database
      .from('vw_link')
      .select()
      .eq('id', id)
      .limit(1)
      .returns<SupabaseViewLink[]>()

    if (!data) {
      throw new NotFoundError('Link was not found')
    }

    const [recovered] = data

    return {
      id: recovered.id,
      long: recovered.long,
      short: recovered.short,
      clicks: recovered.clicks,
      created_at: recovered.created_at,
      expires_at: recovered.expires_at
    }
  }

  async increaseClickByLink({ id }: Required<Pick<Link, 'id'>>): Promise<void> {
    const { data: arrLinks } = await this.database
      .from('tb_link')
      .select()
      .eq('link_id', id)
      .limit(1)
      .returns<SupabaseTableLink[]>()

    if (!arrLinks || arrLinks.length === 0) {
      throw new NotFoundError('Link was not found')
    }

    const [linkRecovered] = arrLinks

    await this.database
      .from('tb_link')
      .update({ link_clicks: linkRecovered.link_clicks + 1 })
      .eq('link_id', id)
  }

  async deleteLinkById({
    id
  }: Required<Pick<Link, 'id'>>): Promise<EliminationType> {
    const { status } = await this.database
      .from('tb_link_per_user')
      .delete()
      .eq('link_id', id)

    if (status !== 204) {
      throw new OperationError(
        'Relation between links and user was not deleted'
      )
    }

    const { status: confirmed } = await this.database
      .from('tb_link')
      .delete()
      .eq('link_id', id)

    if (status !== 204) {
      throw new OperationError('Link was not deleted')
    }

    return { deleted: Boolean(confirmed) }
  }
}

export { Supabase }
