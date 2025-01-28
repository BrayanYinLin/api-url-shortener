import { Router } from 'express'
import { AuthCtrl } from '../controllers/auth.controller'

const routerAuth = Router()
const controller = new AuthCtrl()

routerAuth.get('/', controller.auth)

routerAuth.get('/github', controller.authorizeGithub)

routerAuth.get('/github/callback', controller.callbackGithub)

routerAuth.get('/refresh', controller.refresh)

routerAuth.post('/google', controller.authorizeGoogle)

export { routerAuth }
