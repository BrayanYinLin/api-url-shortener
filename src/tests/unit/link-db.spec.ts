import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Link, User } from '../../types'
import { getExpirationWithTimezone, getRepository } from '../../lib/utils'
import { checkLink } from '../../models/link.model'

const db = getRepository()

describe('Link operations via database', () => {
  const linkIds: string[] = []
  let user: User

  beforeAll(async () => {
    const EMAIL = 'byinlinm@gmail.com'
    user = (await db.findUserByEmail({ email: EMAIL })) as Required<User>
  })

  afterAll(async () => {
    await Promise.all(linkIds.map((id) => db.deleteLinkById({ id })))
  })

  it('should create a new link without expiration', async () => {
    const newShortenedLink = {
      short: 'wallstreet_farid-dieck',
      long: 'https://youtu.be/OrX936HPOus?si=uLY0D7kBJh1j_j56'
    }

    const verifyExistence = await db.findLinkbyShort({
      short: newShortenedLink.short
    })

    expect(verifyExistence).toBeNull()

    const shortenedLink = (await db.createLink(
      {
        short: newShortenedLink.short,
        long: newShortenedLink.long,
        expires_at: null
      },
      {
        id: user.id!
      }
    )) as Required<Link>

    Object.assign(shortenedLink, {
      created_at: new Date(shortenedLink.created_at!).toISOString()
    })
    linkIds.push(shortenedLink.id)
    const modelVerified = checkLink(shortenedLink)
    expect(modelVerified.error).toBeFalsy()
  })

  it('should create a link with expiration', async () => {
    const time = new Date(Date.now())
    time.setDate(time.getDate() + 2) //  agregando dos días
    const link = {
      short: 'trello-board',
      long: 'https://trello.com/u/brayanyl/boards',
      expiration: getExpirationWithTimezone(time.toISOString())
    }

    const verifyExistence = await db.findLinkbyShort({
      short: link.short
    })

    expect(verifyExistence).toBeNull()

    const shortenedLink = (await db.createLink(
      {
        short: link.short,
        long: link.long,
        expires_at: link.expiration
      },
      {
        id: user.id!
      }
    )) as Required<Link>

    Object.assign(shortenedLink, {
      created_at: new Date(shortenedLink.created_at!).toISOString(),
      expires_at: new Date(shortenedLink.expires_at!).toISOString()
    })
    linkIds.push(shortenedLink.id)
    const modelVerified = checkLink(shortenedLink)
    expect(modelVerified.error).toBeFalsy()
  })

  it('should update a link', async () => {
    const shortened = {
      id: linkIds[0],
      long: 'https://youtu.be/z7-9t6E7Cbg?si=x2zTNQfAppNmd3Bo'
    }

    const edittedLink = await db.editLink({
      id: shortened.id,
      long: shortened.long
    })

    Object.assign(edittedLink, {
      created_at: new Date(edittedLink.created_at!).toISOString()
    })
    const linkVerified = checkLink(edittedLink)
    expect(linkVerified.error).toBeFalsy()
  })
})
