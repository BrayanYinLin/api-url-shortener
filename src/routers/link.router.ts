import { Router } from 'express'
import { LinkCtrl } from '../controllers/link.controller'
import { decryptUser } from '../middlewares/decrypt-user'
import { getRepository } from '../lib/utils'

const database = getRepository()
const routerLink = Router()
const controller = new LinkCtrl(database)

routerLink.get('/', controller.findLinkByShort.bind(controller))
routerLink.get(
  '/user',
  decryptUser(),
  controller.findEveryLinksByUser.bind(controller)
)
routerLink.post('/', decryptUser(), controller.createLink.bind(controller))
routerLink.patch('/:id', decryptUser(), controller.editLink.bind(controller))
routerLink.delete(
  '/:id',
  decryptUser(),
  controller.deleteLinkById.bind(controller)
)

export { routerLink }
