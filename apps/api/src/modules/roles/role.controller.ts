import type { Request, Response } from 'express'
import { RoleModel } from './role.model.js'
import { RoleService } from './role.service.js'
import { AppError } from '../../utils/errors/app-error.js'
import { AuditService } from '../audit/audit.service.js'

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

  create = async (req: Request, res: Response) => {
    const role = await this.roleService.create({ data: req.body })
    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'roles.create',
        entityType: 'role',
        entityId: role?.id,
      },
    })

    res.status(201).json(role)
  }

  update = async (req: Request, res: Response) => {
    const role = await this.roleService.update({
      id: req.params.id as string,
      data: req.body,
    })

    if (!role) {
      throw new AppError({
        message: 'Rol no encontrado',
        statusCode: 404,
        code: 'ROLE_NOT_FOUND',
      })
    }

    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'roles.update',
        entityType: 'role',
        entityId: role.id,
      },
    })

    res.json(role)
  }

  activate = async (req: Request, res: Response) => {
    const role = await this.roleService.setActive({
      id: req.params.id as string,
      isActive: true,
    })

    res.json(role)
  }

  deactivate = async (req: Request, res: Response) => {
    const role = await this.roleService.setActive({
      id: req.params.id as string,
      isActive: false,
    })

    res.json(role)
  }

  findPermissions = async (req: Request, res: Response) => {
    const permissions = await this.roleService.findPermissions({
      id: req.params.id as string,
    })

    res.json({ items: permissions })
  }

  updatePermissions = async (req: Request, res: Response) => {
    const permissions = await this.roleService.updatePermissions({
      id: req.params.id as string,
      data: req.body,
    })

    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'roles.permissions.update',
        entityType: 'role',
        entityId: req.params.id as string,
      },
    })

    res.json({ items: permissions })
  }
}
