const createError = ({ name }: { name: string }) => {
  return class CustomError extends Error {
    constructor(message: string) {
      super(message)
      this.name = name
    }
  }
}

export const ErrorGettingTokens = createError({ name: 'ErrorGettingTokens' })
export const ErrorGettingGithubUser = createError({
  name: 'ErrorGettingGithubUser'
})
export const ErrorMissingEmail = createError({
  name: 'ErrorMissingEmail'
})
export const EmailNotAvailable = createError({ name: 'EmailNotAvailable' })
export const UserNotFound = createError({ name: 'UserNotFound' })
export const MissingParameter = createError({ name: 'MissingParameter' })
export const LinkNotFound = createError({ name: 'LinkNotFound' })
