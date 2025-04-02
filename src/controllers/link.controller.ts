import { Request, Response } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { User } from '../types'
import { ERROR_MESSAGES } from '../lib/definitions'
import { checkLink, checkUpdateLink } from '../models/link.model'
import {
  AvailabilityError,
  MissingParameterError,
  NotFoundError
} from '../lib/errors'
import { getRepository } from '../lib/utils'
import { decryptToken } from '../lib/authentication'

class LinkCtrl {
  database!: ReturnType<typeof getRepository>

  constructor(database: ReturnType<typeof getRepository>) {
    this.database = database
  }

  async findEveryLinksByUser(req: Request, res: Response) {
    const access_token = req.cookies.access_token
    const refresh_token = req.cookies.refresh_token

    if (!access_token && refresh_token) {
      return res.status(401).json({ msg: 'Refresh access' })
    } else if (!access_token && !refresh_token) {
      return res.status(401).json({ msg: ERROR_MESSAGES.NOT_AUTHENTICATED })
    }

    try {
      const { id } = (await decryptToken(access_token)) as User

      const links = await this.database.findEveryLinksByUser({ id: id! })

      return res.json(links)
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        return res.status(401).json({ msg: e.message })
      } else {
        console.error(e)
        return res.json({
          msg: `${ERROR_MESSAGES.UNEXPECTED} At links by user.`
        })
      }
    }
  }

  async createLink(req: Request, res: Response) {
    try {
      const { id } = req.user!
      const { long, short, expires_at } = req.body
      const { data, error } = checkLink({ long, short, expires_at })

      if (error) return res.status(422).json(error)

      const check = await this.database.findLinkbyShort({ short })

      if (check) {
        throw new AvailabilityError('This link already exists')
      }

      const link = await this.database.createLink(
        {
          long: data.long,
          short: data.short,
          expires_at:
            data.expires_at?.trim() === '' || !data.expires_at
              ? null
              : data.expires_at
        },
        { id: id! }
      )

      return res.status(201).json(link)
    } catch (e) {
      if (e instanceof AvailabilityError) {
        return res.status(400).json({ msg: e.message })
      } else {
        console.error(e)
        return res.json({
          msg: `${ERROR_MESSAGES.UNEXPECTED} At links by user`
        })
      }
    }
  }

  async editLink(req: Request, res: Response) {
    const { long } = req.body
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ msg: ERROR_MESSAGES.MISSING_PARAM })
    }

    try {
      const { data, error } = checkUpdateLink({ id, long })

      if (error) return res.status(422).json(error)

      const editted = await this.database.editLink({
        id: data.id,
        long: data.long
      })

      return res.json(editted)
    } catch (e) {
      console.error(e)
      return res.json({
        msg: `${ERROR_MESSAGES.UNEXPECTED} At edit endpoint.`
      })
    }
  }

  //  To get access into the original link (update clicks)
  async findLinkByShort(req: Request, res: Response) {
    const { short } = req.query

    try {
      const link = await this.database.findLinkbyShort({ short: String(short) })

      if (!link) {
        throw new NotFoundError(ERROR_MESSAGES.LINK_NOT_FOUND)
      }

      await this.database.increaseClickByLink({ id: link.id! })

      return res.status(200).json({
        id: String(link.id),
        long: link.long,
        short: link.short,
        clicks: Number(link.clicks),
        created_at: link.created_at,
        expires_at: link.expires_at
      })
    } catch (e) {
      if (e instanceof MissingParameterError) {
        return res.status(400).json({ msg: e.message })
      } else if (e instanceof NotFoundError) {
        return res.status(404).json({ msg: e.message })
      } else {
        console.error(e)
        return res
          .status(400)
          .json({ msg: `${ERROR_MESSAGES.UNEXPECTED} Looking by short.` })
      }
    }
  }

  async deleteLinkById(req: Request, res: Response) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ msg: 'Missing identifier (id).' })
    }

    try {
      const { deleted } = await this.database.deleteLinkById({ id })

      if (!deleted) {
        return res.status(400).json({ msg: 'Link could not be deleted' })
      }

      return res.status(200).json({ msg: 'Deleted successfully' })
    } catch (e) {
      console.error(e)
      return res
        .status(400)
        .json({ msg: `${ERROR_MESSAGES.UNEXPECTED} Deleting link.` })
    }
  }
}

export { LinkCtrl }
