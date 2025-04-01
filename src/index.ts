import express from 'express'
import { PORT } from './lib/enviroment'
import { routerAuth as authRouter } from './routers/auth.router'
import { routerLink as linkRouter } from './routers/link.router'
import cookieParser from 'cookie-parser'
import { corsOrigins, preflight } from './middlewares/cors-origins'
import morgan from 'morgan'

const app = express()
const port = Number(PORT) || 5373

app.use(corsOrigins())
app.use(morgan('dev'))
app.options('*', preflight())
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/link', linkRouter)
app.disable('x-powered-by')

const init = async () => {
  app.listen(port)
  console.log(`Running...`)
}

init()

export { app }
