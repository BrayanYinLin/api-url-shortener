import { Router } from 'express'
import { AuthCtrl } from '../controllers/auth.controller'
import { Local } from '../database/local'

const database = new Local()
const routerAuth = Router()
const controller = new AuthCtrl(database)

routerAuth.get('/', controller.auth.bind(controller))

routerAuth.get('/github', controller.authorizeGithub.bind(controller))

routerAuth.get('/github/callback', controller.callbackGithub.bind(controller))

routerAuth.get('/refresh', controller.refresh.bind(controller))

routerAuth.post('/google', controller.authorizeGoogle.bind(controller))

export { routerAuth }
