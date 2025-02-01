import { Router } from 'express'
import { AuthCtrl } from '../controllers/auth.controller'
import { Local } from '../database/local'

const database = new Local()
const routerAuth = Router()
const controller = new AuthCtrl(database)

routerAuth.get('/', controller.auth)

routerAuth.get('/github', controller.authorizeGithub)

routerAuth.get('/github/callback', controller.callbackGithub)

routerAuth.get('/refresh', controller.refresh)

routerAuth.post('/google', controller.authorizeGoogle)

export { routerAuth }
