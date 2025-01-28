import { Request, Response } from 'express'
import { GITHUB_CLIENT, GITHUB_SECRET, JWT_SECRET } from '../lib/enviroment'
import { getGithubAccessToken, getGithubUser } from '../lib/services'
import {
  EmailNotAvailable,
  ErrorGettingGithubUser,
  ErrorGettingTokens
} from '../lib/errors'
import { encryptUser, setCookiesSettings } from '../lib/utils'
import { Local } from '../database/local'
import { decode, JsonWebTokenError, verify } from 'jsonwebtoken'
import { GoogleTokenPayload, User } from '../types'
import { PROVIDERS } from '../lib/definitions'

class AuthCtrl {
  async auth(req: Request, res: Response) {
    const database = new Local()
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
      const recovered = verify(access_token, JWT_SECRET!) as User

      const user = await database.findUserById({ id: recovered.id! })

      // const { access, refresh } = encryptUser({ payload: user })
      // const { access_settings, refresh_settings } = setCookiesSettings()

      return res.json(user)
      // .cookie('access_token', access, access_settings)
      // .cookie('refresh_token', refresh, refresh_settings)
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        return res.status(401).json({ msg: e.message })
      } else {
        console.error(e)
        return res.json({ msg: 'Unexpected error' })
      }
    }
  }

  async refresh(req: Request, res: Response) {
    const database = new Local()
    const access_token = req.cookies.access_token
    const refresh_token = req.cookies.refresh_token

    if (!access_token && !refresh_token) {
      return res.status(401).json({ msg: 'missing authentication' })
    }

    try {
      const recovered = verify(access_token, JWT_SECRET!) as User

      const user = await database.findUserById(recovered)

      const { access, refresh } = encryptUser({ payload: user })
      const { access_settings, refresh_settings } = setCookiesSettings()

      return res
        .cookie('access_token', access, access_settings)
        .cookie('refresh_token', refresh, refresh_settings)
        .json(user)
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        return res.status(401).json({ msg: e.message })
      } else {
        console.error(e)
        return res.json({ msg: 'Unexpected error' })
      }
    }
  }

  async authorizeGithub(_: Request, res: Response) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT}&scope=read:user,user:email`
    return res.json({ link: githubAuthUrl })
  }

  async callbackGithub(req: Request, res: Response) {
    const database = new Local()
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
      const checkUser = await database.findUserByEmail({
        email: userRecovered.email
      })

      if (checkUser && checkUser.provider.provider_name !== PROVIDERS.GITHUB) {
        throw new EmailNotAvailable('This email is used by another provider')
      }

      const newUser = checkUser ?? (await database.createUser(userRecovered))
      const { access, refresh } = encryptUser({ payload: newUser })
      const { access_settings, refresh_settings } = setCookiesSettings()

      return res
        .cookie('access_token', access, access_settings)
        .cookie('refresh_token', refresh, refresh_settings)
        .json(newUser)
    } catch (e) {
      if (e instanceof ErrorGettingTokens) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof ErrorGettingGithubUser) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof EmailNotAvailable) {
        return res.status(400).json({ msg: e.message })
      } else {
        console.error(e)
        return res.status(500).send('Error during authentication')
      }
    }
  }

  async authorizeGoogle(req: Request, res: Response) {
    const database = new Local()
    const { token } = req.body

    try {
      const decoded = decode(token) as GoogleTokenPayload

      const mappedUser: User = {
        provider: { provider_name: PROVIDERS.GOOGLE },
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture
      }

      const checkUser = await database.findUserByEmail({
        email: mappedUser.email
      })

      if (checkUser && checkUser.provider.provider_name !== PROVIDERS.GOOGLE) {
        throw new EmailNotAvailable('This email is used by another provider')
      }

      const newUser = checkUser ?? (await database.createUser(mappedUser))
      const { access, refresh } = encryptUser({ payload: newUser })
      const { access_settings, refresh_settings } = setCookiesSettings()

      return res
        .cookie('access_token', access, access_settings)
        .cookie('refresh_token', refresh, refresh_settings)
        .json(newUser)
    } catch (e) {
      if (e instanceof EmailNotAvailable) {
        return res.status(400).json({ msg: e.message })
      } else {
        console.error(e)
        return res.status(400).json({ msg: 'unexpected error' })
      }
    }
  }
}

export { AuthCtrl }
