import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import supertest from 'supertest'
import { z } from 'zod'

import { app } from '../..'
import { Cookies, Link } from '../../types'
import { createCookieForTesting } from './fake-auth'
import { getExpirationWithTimezone, getRepository } from '../../lib/utils'
import { link } from '../../models/link.model'

const db = getRepository()

describe('Link api', () => {
  let cookies: Cookies
  const links: Required<Link>[] = []

  beforeAll(async () => {
    const EMAIL = 'byinlinm@gmail.com'
    cookies = await createCookieForTesting({ email: EMAIL })
  })

  afterAll(async () => {
    await Promise.all(links.map(({ id }) => db.deleteLinkById({ id })))
  })

  it('should return a link via API', async () => {
    const response = await supertest(app)
      .get('/api/link/?short=type_hero')
      .send()
      .expect(200)

    const { long } = response.body
    expect(() => z.string().url().parse(long)).not.throw()
  })

  it('should return all links by user via API', async () => {
    const response = await supertest(app)
      .get('/api/link/user')
      .set('Cookie', [
        `access_token=${cookies.access};refresh_token=${cookies.refresh}`
      ])
      .expect(200)

    const links = response.body as Link[]
    expect(() => links.map((e) => link.parse(e))).not.toThrow()
  })

  it('should create a classic link', async () => {
    const shortened = {
      short: 'crime_and_punishment',
      long: 'https://es.wikipedia.org/wiki/Crimen_y_castigo',
      expires_at: null
    }

    const response = await supertest(app)
      .post('/api/link/')
      .set('Cookie', [
        `access_token=${cookies.access};refresh_token=${cookies.refresh}`
      ])
      .send(shortened)
      .expect(201)

    const linkCreated = response.body
    links.push(linkCreated)
    expect(() => link.parse(linkCreated)).not.toThrow()
  })

  it('should create a temporal link via API', async () => {
    const time = new Date(Date.now())
    time.setDate(time.getDate() + 2) // agregando dos dias
    const shortened = {
      short: 'orwell-1984',
      long: 'https://www.philosophia.cl/biblioteca/orwell/1984.pdf',
      expires_at: getExpirationWithTimezone(time.toISOString())
    }

    const createdLink = await supertest(app)
      .post('/api/link/')
      .set('Cookie', [
        `access_token=${cookies.access};refresh_token=${cookies.refresh}`
      ])
      .send(shortened)
      .expect(201)

    const linkCreated = createdLink.body
    links.push(linkCreated)
    expect(() => link.parse(linkCreated)).not.toThrow()
  })
})
