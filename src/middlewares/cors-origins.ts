import cors from 'cors'
import { DEPLOYED_CLIENT, LOCAL_CLIENT } from '../lib/enviroment'

const modifyOrigin = (origin: string) => origin + '/'

export function corsOrigins() {
  const originsAdmitted = [
    DEPLOYED_CLIENT!,
    modifyOrigin(DEPLOYED_CLIENT!),
    LOCAL_CLIENT!,
    modifyOrigin(LOCAL_CLIENT!)
  ]

  return cors({
    origin: (origin, callback) => {
      if (originsAdmitted.findIndex((o) => o === origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS ${origin}`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}

export function preflight() {
  const originsAdmitted = [
    DEPLOYED_CLIENT!,
    modifyOrigin(DEPLOYED_CLIENT!),
    LOCAL_CLIENT!,
    modifyOrigin(LOCAL_CLIENT!)
  ]

  return cors({
    origin: function (origin, callback) {
      if (originsAdmitted.indexOf(origin!) !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS ${origin}`))
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}
