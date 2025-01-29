import { Request, Response, NextFunction } from 'express'
import { ERROR_MESSAGES } from '../lib/definitions'
// import { JsonWebTokenError, verify } from 'jsonwebtoken'
import { JsonWebTokenError } from 'jsonwebtoken'
// import { JWT_SECRET } from '../lib/enviroment'
// import { User } from '../types'
import { Local } from '../database/local'

export const decryptUser = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // const access_token = req.cookies.access_token
    // const refresh_token = req.cookies.refresh_token

    // if (!access_token && refresh_token) {
    //   return res.status(401).json({ msg: ERROR_MESSAGES.REFRESH_ACCESS_TOKEN })
    // } else if (!access_token && !refresh_token) {
    //   return res.status(401).json({ msg: ERROR_MESSAGES.NOT_AUTHENTICATED })
    // }
    const database = new Local()

    try {
      // const user = verify(access_token, JWT_SECRET!) as User
      const user = await database.findUserById({
        id: '3f206f73-fd12-4c57-8313-6500549404f2'
      })

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
