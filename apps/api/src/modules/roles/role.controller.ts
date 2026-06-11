import type { Request, Response } from 'express'
import { RoleModel } from './role.model.js'
import { RoleService } from './role.service.js'
import { AppError } from '../../utils/errors/app-error.js'

export class RoleController {
  private readonly roleService: RoleService

  constructor({ roleModel }: { roleModel: typeof RoleModel }) {
    this.roleService = new RoleService({ roleModel: roleModel })
  }

  findAll = async (req: Request, res: Response) => {
    const roles = await this.roleService.findAll()

    res.json({
      items: roles,
    })
  }

  findById = async (req: Request, res: Response) => {
    const role = await this.roleService.findById({
      id: req.params.id as string,
    })

    if (!role) {
      throw new AppError({
        message: 'Rol no encontrado',
        statusCode: 404,
        code: 'ROLE_NOT_FOUND',
      })
    }

    res.json(role)
  }
}
