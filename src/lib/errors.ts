/**
 * 💡 **Guía para nombrar errores de manera clara y estructurada**
 *
 * 📌 **Principios para nombres de errores**
 * 1. **Claridad** → Usa nombres descriptivos que indiquen el tipo de error.
 * 2. **Consistencia** → Agrega el sufijo `Error` para identificarlo fácilmente.
 * 3. **Especificidad** → Diferencia los errores según su contexto.
 *
 * 🚀 **Ejemplo de uso**
 * ```ts
 * const NotFoundError = createError({ name: "NotFoundError" });
 * const ValidationError = createError({ name: "ValidationError" });
 * const AuthenticationError = createError({ name: "AuthenticationError" });
 * const AuthorizationError = createError({ name: "AuthorizationError" });
 * const DatabaseError = createError({ name: "DatabaseError" });
 * const InternalServerError = createError({ name: "InternalServerError" });
 *
 * 🏗 **Estrategia de nombres por contexto**
 * | **Contexto**       | **Ejemplo de nombre de error**       |
 * |--------------------|------------------------------------|
 * | No encontrado      | `NotFoundError`                   |
 * | Validación        | `ValidationError`                 |
 * | Autenticación     | `AuthenticationError`             |
 * | Autorización      | `AuthorizationError`              |
 * | Base de datos     | `DatabaseError`                   |
 * | Servidor interno  | `InternalServerError`             |
 * | Tiempo de espera  | `TimeoutError`                    |
 * | Conexión          | `ConnectionError`                 |
 * | Formato inválido  | `InvalidFormatError`              |
 */

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
//  New errors
export const MissingParameterError = createError({
  name: 'MissingParameterError'
})
export const TokenNotFound = createError({ name: 'TokenNotFound' })
export const NotFoundError = createError({ name: 'NotFoundError' })
export const InternalServerError = createError({ name: 'InternalServerError' })
export const OperationError = createError({ name: 'OperationError' })
export const AvailabilityError = createError({ name: 'AvailabilityError' })
