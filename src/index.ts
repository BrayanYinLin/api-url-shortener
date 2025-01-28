import express from 'express'
import { PORT } from './lib/enviroment'
import { routerAuth as authRouter } from './routers/auth.router'
import { routerLink as linkRouter } from './routers/link.router'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
const port = Number(PORT) || 5373

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/link', linkRouter)

const init = async () => {
  app.listen(port)
  console.log('running at http://localhost:5373')
}

init()
