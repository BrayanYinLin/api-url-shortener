import { Request, Response } from 'express'
import { Local } from '../database/local'
import { JWT_SECRET } from '../lib/enviroment'
import { JsonWebTokenError, verify } from 'jsonwebtoken'
import { User } from '../types'
import { ERROR_MESSAGES } from '../lib/definitions'
import { checkLink, checkUpdateLink } from '../models/link.model'
import { MissingParameter } from '../lib/errors'

class LinkCtrl {
  database!: Local

  constructor(database: Local) {
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
      const { id } = verify(access_token, JWT_SECRET!) as User

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
      const { long, short } = req.body
      const { data, error } = checkLink({ long, short })

      if (error) return res.status(422).json(error)

      const check = await this.database.findLinkbyShort({ short })

      if (check) {
        return res.status(400).json({ msg: ERROR_MESSAGES.NAME_UNAVAILABLE })
      }

      const link = await this.database.createLink(
        { long: data.long, short: data.short },
        { id }
      )

      return res.status(201).json(link)
    } catch (e) {
      console.error(e)
      return res.json({
        msg: `${ERROR_MESSAGES.UNEXPECTED} At links by user`
      })
    }
  }

  async editLink(req: Request, res: Response) {
    const database = new Local()
    const { long, short } = req.body
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ msg: ERROR_MESSAGES.MISSING_PARAM })
    }

    try {
      const { data, error } = checkUpdateLink({ id, long, short })

      if (error) return res.status(422).json(error)

      const check = await database.findLinkbyShort({ short: data.short })

      // console.log(`Is there any short with this name? ${check}`)
      if (check) {
        return res.status(400).json({ msg: ERROR_MESSAGES.NAME_UNAVAILABLE })
      }

      const editted = await database.editLink({
        id: data.id,
        long: data.long,
        short: data.short
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
        return res.status(404).json({ msg: ERROR_MESSAGES.LINK_NOT_FOUND })
      }

      await this.database.increaseClickByLink({ id: link.id! })

      return res.status(200).json({
        id: String(link.id),
        long: link.long,
        short: link.short,
        clicks: Number(link.clicks),
        created_at: link.created_at
      })
    } catch (e) {
      if (e instanceof MissingParameter) {
        return res.status(400).json({ msg: e.message })
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
