import { encryptUser } from '../../lib/authentication'
import { NotFoundError } from '../../lib/errors'
import { getRepository } from '../../lib/utils'
import { Cookies, User } from '../../types'

export const createCookieForTesting = async ({
  email
}: Pick<User, 'email'>): Promise<Cookies> => {
  const db = getRepository()
  const user = await db.findUserByEmail({ email })
  if (!user) throw new NotFoundError('User not found')
  const { access, refresh } = await encryptUser({ payload: user })

  return { access, refresh }
}
