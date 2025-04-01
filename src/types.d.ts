import { z } from 'zod'
import { provider, user } from './models/user.model'
import { link } from './models/link.model'
// import { Pool } from 'pg'
// import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database'

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

export type EliminationType = {
  deleted: boolean
}

export type Cookies = {
  access: string
  refresh: string
}

type SingletonInstance<T> = T | null

export interface Repository<T> {
  database: T
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
  createLink(
    { long, short }: Pick<Link, 'long' | 'short' | 'expires_at'>,
    { id }: Required<Pick<User, 'id'>>
  ): Promise<Link>
  editLink({ id, long }: Required<Pick<Link, 'id' | 'long'>>): Promise<Link>
  increaseClickByLink({ id }: Required<Pick<Link, 'id'>>): Promise<void>
  deleteLinkById({ id }: Required<Pick<Link, 'id'>>): Promise<EliminationType>
}

export type SupabasePublic = Database[Extract<keyof Database, 'public'>]
//  Views
export type SupabaseViews = SupabasePublic[Extract<
  keyof SupabasePublic,
  'Views'
>]
//  Tables
export type SupabaseTables = SupabasePublic[Extract<
  keyof SupabasePublic,
  'Tables'
>]
//  View User
export type SupabaseViewUser = Required<{
  [K in keyof Pick<SupabaseViews, 'vw_user'>['vw_user']['Row']]: NonNullable<
    Pick<SupabaseViews, 'vw_user'>['vw_user']['Row'][K]
  >
}>
//  Table Provider
export type SupabaseProvider = Required<{
  [K in keyof Pick<
    SupabaseTables,
    'tb_provider'
  >['tb_provider']['Row']]: NonNullable<
    Pick<SupabaseTables, 'tb_provider'>['tb_provider']['Row'][K]
  >
}>
//  View Links Per User
export type SupabaseViewLinkPerUser = Required<{
  [K in keyof Pick<
    SupabaseViews,
    'vw_link_per_user'
  >['vw_link_per_user']['Row']]: NonNullable<
    Pick<SupabaseViews, 'vw_link_per_user'>['vw_link_per_user']['Row'][K]
  >
}>
//  View Link
export type SupabaseViewLink = Required<{
  [K in keyof Pick<SupabaseViews, 'vw_link'>['vw_link']['Row']]: NonNullable<
    Pick<SupabaseViews, 'vw_link'>['vw_link']['Row'][K]
  >
}>
//  Table Link
export type SupabaseTableLink = Required<{
  [K in keyof Pick<SupabaseTables, 'tb_link'>['tb_link']['Row']]: NonNullable<
    Pick<SupabaseTables, 'tb_link'>['tb_link']['Row'][K]
  >
}>

export type SupabaseTableUsers = Required<{
  [K in keyof Pick<SupabaseTables, 'tb_users'>['tb_users']['Row']]: NonNullable<
    Pick<SupabaseTables, 'tb_users'>['tb_users']['Row'][K]
  >
}>
