import { Request, Response, NextFunction } from 'express'
import { ERROR_MESSAGES } from '../lib/definitions'
import { User } from '../types'
import { decryptToken } from '../lib/authentication'
import * as jose from 'jose'

export const decryptUser = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token
    const refresh_token = req.cookies.refresh_token

    if (!access_token && refresh_token) {
      return res.status(401).json({ msg: ERROR_MESSAGES.REFRESH_ACCESS_TOKEN })
    } else if (!access_token && !refresh_token) {
      return res.status(401).json({ msg: ERROR_MESSAGES.NOT_AUTHENTICATED })
    }

    try {
      const user = (await decryptToken(access_token)) as User

      req.user = user
      next()
    } catch (e) {
      if (e instanceof jose.errors.JWTInvalid) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof jose.errors.JWTExpired) {
        return res.status(401).json({ msg: e.message })
      } else if (e instanceof jose.errors.JWEDecryptionFailed) {
        return res.status(401).json({ msg: e.message })
      } else {
        console.error(e)
        return res.status(400).json({
          msg: `${ERROR_MESSAGES.UNEXPECTED} At decrypt user middleware.`
        })
      }
    }
  }
}
