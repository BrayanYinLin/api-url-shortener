import { base64url, EncryptJWT, jwtDecrypt } from 'jose'
import { ENVIRONMENT, JWT_SECRET } from './enviroment'
import { User } from '../types'

const setTokenMetadata = () => {
  let issuer = ''
  let audience = ''

  if (ENVIRONMENT === 'PRODUCTION') {
    issuer = 'https://cool-shortener-production.up.railway.app'
    audience = 'https://best-shorter.vercel.app'

    return { issuer, audience }
  }

  return { issuer: 'http://localhost:5373', audience: 'http://localhost:5173' }
}

type TokenMetadata = {
  payload: User | Required<Pick<User, 'id'>>
  exp: string | number | Date
}

export const generateToken = async ({ payload, exp }: TokenMetadata) => {
  const { issuer, audience } = setTokenMetadata()

  const jwt = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(exp)
    .encrypt(base64url.decode(JWT_SECRET!))

  return jwt
}

export const decryptToken = async (jwt: string) => {
  const secret = base64url.decode(JWT_SECRET!)
  const { issuer, audience } = setTokenMetadata()
  const { payload } = await jwtDecrypt(jwt, secret, {
    issuer,
    audience
  })

  return payload
}

export const encryptUser = async ({ payload }: { payload: User }) => {
  const access = await generateToken({
    payload,
    exp: '2h'
  })

  const refresh = await generateToken({
    payload: { id: payload.id! },
    exp: '15d'
  })

  return { access, refresh }
}
