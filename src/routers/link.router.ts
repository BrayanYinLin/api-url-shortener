import { Router } from 'express'
import { LinkCtrl } from '../controllers/link.controller'
import { decryptUser } from '../middlewares/decrypt-user'
import { Local } from '../database/local'

const database = new Local()
const routerLink = Router()
const controller = new LinkCtrl(database)

routerLink.get('/', controller.findLinkByShort.bind(controller))
routerLink.get('/user', controller.findEveryLinksByUser.bind(controller))
routerLink.post('/', decryptUser(), controller.createLink.bind(controller))
routerLink.patch('/:id', decryptUser(), controller.editLink.bind(controller))

export { routerLink }
