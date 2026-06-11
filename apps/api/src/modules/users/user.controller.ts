import type { Request, Response } from 'express'
import { UserModel } from './user.model.js'
import { UserService } from './user.service.js'
import { AppError } from '../../utils/errors/app-error.js'

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
      createdByUserId: req.user?.id as string,
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

    res.json(user)
  }

  desactivate = async (req: Request, res: Response) => {
    const user = await this.userService.setActive({
      id: req.params.id as string,
      isActive: false,
    })

    res.json(user)
  }

  activate = async (req: Request, res: Response) => {
    const user = await this.userService.setActive({
      id: req.params.id as string,
      isActive: true,
    })

    res.json(user)
  }
}
