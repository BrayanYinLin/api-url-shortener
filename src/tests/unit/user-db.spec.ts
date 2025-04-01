import { describe, expect, it } from 'vitest'
import { checkUser } from '../../models/user.model'
import { User } from '../../types'
import { getRepository } from '../../lib/utils'

const db = getRepository()

describe('User operations via database', () => {
  let userId: string

  it('should return a user by email', async () => {
    const EMAIL = 'byinlinm@gmail.com'
    const user = (await db.findUserByEmail({ email: EMAIL })) as Required<User>
    Object.assign(user, {
      created_at: new Date(user.created_at).toISOString()
    })

    expect(user).not.toBeNull()
    const verified = checkUser(user)
    expect(verified.error).toBeFalsy()
    userId = user.id
  })

  it('should return a user by its id', async () => {
    const user = (await db.findUserById({ id: userId })) as Required<User>
    Object.assign(user, {
      created_at: new Date(user.created_at).toISOString()
    })

    expect(user).not.toBeNull()
    const verified = checkUser(user)
    expect(verified.error).toBeFalsy()
  })
})
