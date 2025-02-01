import { Router } from 'express'
import { LinkCtrl } from '../controllers/link.controller'
import { decryptUser } from '../middlewares/decrypt-user'
import { Local } from '../database/local'

const database = new Local()
const routerLink = Router()
const controller = new LinkCtrl(database)

routerLink.get('/', controller.findEveryLinksByUser)
routerLink.post('/', decryptUser(), controller.createLink)
routerLink.patch('/:id', decryptUser(), controller.editLink)

export { routerLink }
