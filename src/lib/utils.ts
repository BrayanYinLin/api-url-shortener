import { Repository, User } from '../types'
import { sign } from 'jsonwebtoken'
import { ENVIRONMENT, JWT_SECRET } from './enviroment'
import { CookieOptions } from 'express'
import { MILLISECONDS_TIMES } from './definitions'
import { Local } from '../database/local'
import { Supabase } from '../database/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

export const parseCookie = ({
  cookiesSet,
  tokenName
}: {
  cookiesSet: string[]
  tokenName: string
}) => {
  let match
  for (const cookie of cookiesSet) {
    const regex = new RegExp(`(?:^|; )${tokenName}=([^;]*)`)
    match = cookie.match(regex)
    if (match) {
      return `${tokenName}=${match[1]}`
    }
  }
  return ''
}

export const encryptUser = ({ payload }: { payload: User }) => {
  // const FITHTEEN_DAYS_SECONDS = 60 * 60 * 24 * 15
  // const TWO_HOURS = 3600 * 2

  const access = sign(payload, JWT_SECRET!, {
    expiresIn: '2h'
  })

  const refresh = sign({ id: payload.id! }, JWT_SECRET!, {
    expiresIn: '15d'
  })

  return { access, refresh }
}

type CookieSettings = {
  access_settings: CookieOptions
  refresh_settings: CookieOptions
}

export const setCookiesSettings = (): CookieSettings => {
  const { FITHTEEN_DAYS_SECONDS, TWO_HOURS } = MILLISECONDS_TIMES

  const access_settings: CookieOptions = {
    httpOnly: ENVIRONMENT === 'PRODUCTION',
    maxAge: TWO_HOURS,
    domain:
      ENVIRONMENT === 'PRODUCTION'
        ? 'cool-shortener-production.up.railway.app'
        : 'localhost',
    secure: ENVIRONMENT === 'PRODUCTION',
    sameSite: ENVIRONMENT === 'PRODUCTION' ? 'none' : 'lax',
    path: '/'
  }

  const refresh_settings: CookieOptions = {
    httpOnly: ENVIRONMENT === 'PRODUCTION',
    maxAge: FITHTEEN_DAYS_SECONDS,
    domain:
      ENVIRONMENT === 'PRODUCTION'
        ? 'cool-shortener-production.up.railway.app'
        : 'localhost',
    secure: ENVIRONMENT === 'PRODUCTION',
    sameSite: ENVIRONMENT === 'PRODUCTION' ? 'none' : 'lax',
    path: '/'
  }

  return { access_settings, refresh_settings }
}

export const getClearCookiesSettings = () => {
  const settings: CookieOptions = {
    httpOnly: ENVIRONMENT === 'PRODUCTION',
    secure: ENVIRONMENT === 'PRODUCTION',
    // expires: new Date(0),
    domain:
      ENVIRONMENT === 'PRODUCTION'
        ? 'cool-shortener-production.up.railway.app'
        : 'localhost',
    sameSite: ENVIRONMENT === 'PRODUCTION' ? 'none' : 'lax',
    path: '/'
  }

  return { settings }
}

export const getRepository = (): Repository<Pool | SupabaseClient> => {
  if (ENVIRONMENT === 'PRODUCTION') {
    return new Supabase()
  }

  return new Local()
}
