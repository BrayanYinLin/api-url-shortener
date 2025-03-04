import { Request, Response } from 'express'
import {
  GITHUB_CLIENT,
  GITHUB_SECRET,
  GOOGLE_CALLBACK,
  GOOGLE_CLIENT,
  GOOGLE_SECRET
} from '../lib/enviroment'
import { getGithubAccessToken, getGithubUser } from '../lib/services'
import {
  AvailabilityError,
  ErrorGettingGithubUser,
  NotFoundError,
  OperationError,
  TokenNotFound
} from '../lib/errors'
import {
  getClearCookiesSettings,
  getRepository,
  setCookiesSettings
} from '../lib/utils'
import { JsonWebTokenError } from 'jsonwebtoken'
import { User } from '../types'
import { ERROR_MESSAGES, PROVIDERS } from '../lib/definitions'
import axios from 'axios'
import { decryptToken, encryptUser } from '../lib/authentication'
import * as jose from 'jose'

class AuthCtrl {
  database!: ReturnType<typeof getRepository>

  constructor(database: ReturnType<typeof getRepository>) {
    this.database = database
  }

  async auth(req: Request, res: Response) {
    const access_token = req.cookies.access_token
    const refresh_token = req.cookies.refresh_token

    if (!access_token && refresh_token) {
      return res.status(401).json({ msg: 'Refresh access' })
    } else if (!access_token && !refresh_token) {
      return res
        .status(401)
        .json({ msg: 'Missing authentication. Sign in again.' })
    }

    try {
      const recovered = (await decryptToken(access_token)) as User

      const user = await this.database.findUserById({ id: recovered.id! })

      return res.json(user)
    } catch (e) {
      if (e instanceof jose.errors.JWTInvalid) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof jose.errors.JWTExpired) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof jose.errors.JWEDecryptionFailed) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof NotFoundError) {
        return res.status(404).json({ msg: e.message })
      } else {
        console.error(e)
        return res.json({ msg: 'Unexpected error' })
      }
    }
  }

  async refresh(req: Request, res: Response) {
    const access_token = req.cookies.access_token
    const refresh_token = req.cookies.refresh_token

    if (!access_token && !refresh_token) {
      return res.status(401).json({ msg: 'missing authentication' })
    }

    try {
      const recovered = (await decryptToken(refresh_token)) as Pick<User, 'id'>

      const user = await this.database.findUserById({ id: recovered.id! })

      const { access } = await encryptUser({ payload: user })
      const { access_settings } = setCookiesSettings()

      return res.cookie('access_token', access, access_settings).json(user)
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof NotFoundError) {
        return res.status(404).json({ msg: e.message })
      } else {
        console.error(e)
        return res.json({ msg: 'Unexpected error' })
      }
    }
  }

  async logout(_: Request, res: Response) {
    const { settings } = getClearCookiesSettings()
    return res
      .clearCookie('access_token', settings)
      .clearCookie('refresh_token', settings)
      .json({ msg: 'Log out succesfully' })
  }

  async authorizeGithub(_: Request, res: Response) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT}&scope=read:user,user:email`
    return res.json({ link: githubAuthUrl })
  }

  async callbackGithub(req: Request, res: Response) {
    const { code } = req.query

    if (!code) return res.status(400).json({ msg: 'No code provided' })

    const searchParams = new URLSearchParams({
      client_id: GITHUB_CLIENT!,
      client_secret: GITHUB_SECRET!,
      code: code as string
    })

    try {
      const access_token = await getGithubAccessToken({ params: searchParams })
      const userRecovered = await getGithubUser({ access_token })
      const checkUser = await this.database.findUserByEmail({
        email: userRecovered.email
      })

      if (checkUser && checkUser.provider.provider_name !== PROVIDERS.GITHUB) {
        throw new AvailabilityError('This email is used by another provider')
      }

      const newUser =
        checkUser ?? (await this.database.createUser(userRecovered))
      const { access, refresh } = await encryptUser({ payload: newUser })
      const { access_settings, refresh_settings } = setCookiesSettings()

      return res
        .cookie('access_token', access, access_settings)
        .cookie('refresh_token', refresh, refresh_settings)
        .json(newUser)
    } catch (e) {
      if (e instanceof TokenNotFound) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof ErrorGettingGithubUser) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof NotFoundError) {
        return res.status(404).json({ msg: e.message })
      } else if (e instanceof OperationError) {
        return res.status(409).json({ msg: e.message })
      } else if (e instanceof AvailabilityError) {
        return res.status(400).json({ msg: e.message })
      } else {
        console.error(e)
        return res.status(400).json({ msg: ERROR_MESSAGES.UNEXPECTED })
      }
    }
  }

  async authorizeGoogle(_: Request, res: Response) {
    const root =
      'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount'
    const options = {
      redirect_uri: GOOGLE_CALLBACK!,
      client_id: GOOGLE_CLIENT!,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' ')
    }

    const qs = new URLSearchParams(options)

    return res.json({ link: `${root}?${qs.toString()}` })
  }

  async callbackGoogle(req: Request, res: Response) {
    const { code } = req.query

    if (!code) return res.status(400).json({ msg: 'Missing code' })

    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: GOOGLE_CLIENT,
        client_secret: GOOGLE_SECRET,
        redirect_uri: GOOGLE_CALLBACK,
        grant_type: 'authorization_code'
      })

      const { access_token } = data

      const { data: user } = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      )

      const checkUser = await this.database.findUserByEmail({
        email: user.email
      })

      if (checkUser && checkUser.provider.provider_name !== PROVIDERS.GOOGLE) {
        throw new AvailabilityError('This email is used by another provider')
      }

      let newUser: User
      if (checkUser === null || !checkUser) {
        newUser = await this.database.createUser({
          email: user.email,
          name: user.name,
          avatar: user.picture,
          provider: { provider_name: PROVIDERS.GOOGLE }
        })
      } else {
        newUser = checkUser
      }
      const { access, refresh } = await encryptUser({ payload: newUser })
      const { access_settings, refresh_settings } = setCookiesSettings()

      return res
        .status(201)
        .cookie('access_token', access, access_settings)
        .cookie('refresh_token', refresh, refresh_settings)
        .json(newUser)
    } catch (e) {
      if (e instanceof NotFoundError) {
        return res.status(404).json({ msg: e.message })
      } else if (e instanceof OperationError) {
        return res.status(409).json({ msg: e.message })
      } else if (e instanceof AvailabilityError) {
        return res.status(403).json({ msg: e.message })
      } else {
        console.error(e)
        return res.status(400).json({ msg: ERROR_MESSAGES.UNEXPECTED })
      }
    }
  }
}

export { AuthCtrl }
