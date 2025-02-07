import { Request, Response, NextFunction } from 'express'
import { ERROR_MESSAGES } from '../lib/definitions'
import { JsonWebTokenError, verify } from 'jsonwebtoken'
import { JWT_SECRET } from '../lib/enviroment'
import { User } from '../types'

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
      const user = verify(access_token, JWT_SECRET!) as User

      req.user = user
      next()
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        return res.status(400).json({ msg: ERROR_MESSAGES.TOKEN_ERROR })
      } else {
        console.error(e)
        return res.status(400).json({
          msg: `${ERROR_MESSAGES.UNEXPECTED} At decrypt user middleware.`
        })
      }
    }
  }
}
