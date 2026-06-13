import type { Request, Response } from 'express'
import { UserModel } from './user.model.js'
import { UserService } from './user.service.js'
import { AppError } from '../../utils/errors/app-error.js'
import { AuditService } from '../audit/audit.service.js'

export class UserController {
  private readonly userService: UserService

  constructor({ userModel }: { userModel: typeof UserModel }) {
    this.userService = new UserService({ userModel })
  }

  findAll = async (req: Request, res: Response) => {
    const users = await this.userService.findAll()

    res.json({
      items: users,
    })
  }

  findById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const user = await this.userService.findById({ id })

    if (!user) {
      throw new AppError({
        message: 'Usuario no encontrado',
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      })
    }

    res.json(user)
  }

  create = async (req: Request, res: Response) => {
    const user = await this.userService.create({
      data: req.body,
      currentUser: req.user!,
    })
    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'users.create',
        entityType: 'user',
        entityId: user?.id,
      },
    })

    res.status(201).json(user)
  }

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const user = await this.userService.update({
      id,
      data: req.body,
    })

    if (!user) {
      throw new AppError({
        message: 'Usuario no encontrado',
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      })
    }

    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'users.update',
        entityType: 'user',
        entityId: user.id,
      },
    })

    res.json(user)
  }

  desactivate = async (req: Request, res: Response) => {
    const user = await this.userService.setActive({
      id: req.params.id as string,
      isActive: false,
    })
    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'users.deactivate',
        entityType: 'user',
        entityId: req.params.id as string,
      },
    })

    res.json(user)
  }

  activate = async (req: Request, res: Response) => {
    const user = await this.userService.setActive({
      id: req.params.id as string,
      isActive: true,
    })
    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'users.activate',
        entityType: 'user',
        entityId: req.params.id as string,
      },
    })

    res.json(user)
  }
}
