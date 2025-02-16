import { User } from '../types'
import { PROVIDERS } from './definitions'
import {
  ErrorGettingGithubUser,
  ErrorMissingEmail,
  TokenNotFound
} from './errors'

export const getGithubAccessToken = async ({
  params
}: {
  params: URLSearchParams
}) => {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: params
  })

  if (!response.ok) {
    throw new TokenNotFound('Error trying to get access tokens, check params.')
  }

  const { access_token } = await response.json()

  return access_token
}

type Emails = {
  email: string
  primary: boolean
  verified: boolean
  visibility: string
}

export const getGithubUser = async ({
  access_token
}: {
  access_token: string
}): Promise<User> => {
  const { GITHUB } = PROVIDERS
  const response = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` }
  })

  const emailsResponse = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${access_token}` }
  })

  const emails: Emails[] = await emailsResponse.json()
  const userEmail = emails.find((email) => email.primary)?.email

  if (!userEmail) {
    throw new ErrorMissingEmail('Error trying to find user email')
  }

  if (!response.ok) {
    throw new ErrorGettingGithubUser(
      'Error trying to access to user info. check tokens.'
    )
  }

  const user = await response.json()

  return {
    name: user.name,
    email: userEmail,
    avatar: user.avatar_url,
    provider: {
      provider_name: GITHUB
    }
  }
}
