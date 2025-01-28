import { Router } from 'express'
import { LinkCtrl } from '../controllers/link.controller'
import { decryptUser } from '../middlewares/decrypt-user'

const routerLink = Router()
const controller = new LinkCtrl()

routerLink.get('/', controller.findEveryLinksByUser)
routerLink.post('/', decryptUser(), controller.createLink)

export { routerLink }
