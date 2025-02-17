import { Router } from 'express'
import { AuthCtrl } from '../controllers/auth.controller'
import { getRepository } from '../lib/utils'

const database = getRepository()
const routerAuth = Router()
const controller = new AuthCtrl(database)

routerAuth.get('/', controller.auth.bind(controller))

routerAuth.get('/github', controller.authorizeGithub.bind(controller))

routerAuth.get('/github/callback', controller.callbackGithub.bind(controller))

routerAuth.get('/google', controller.authorizeGoogle.bind(controller))

routerAuth.get('/google/callback', controller.callbackGoogle.bind(controller))

routerAuth.get('/refresh', controller.refresh.bind(controller))

routerAuth.post('/logout', controller.logout.bind(controller))

export { routerAuth }
