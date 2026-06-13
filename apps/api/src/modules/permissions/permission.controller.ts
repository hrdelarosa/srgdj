import type { Request, Response } from 'express'
import { AppError } from '../../utils/errors/app-error.js'
import { AuditService } from '../audit/audit.service.js'
import { PermissionService } from './permission.service.js'

export class PermissionController {
  private permissionService = new PermissionService()

  findAll = async (req: Request, res: Response) => {
    const permissions = await this.permissionService.findAll()
    res.json({ items: permissions })
  }

  findById = async (req: Request, res: Response) => {
    const permission = await this.permissionService.findById({
      id: req.params.id as string,
    })

    if (!permission) {
      throw new AppError({
        message: 'Permiso no encontrado',
        statusCode: 404,
        code: 'PERMISSION_NOT_FOUND',
      })
    }

    res.json(permission)
  }

  create = async (req: Request, res: Response) => {
    const permission = await this.permissionService.create({ data: req.body })
    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'permissions.create',
        entityType: 'permission',
        entityId: permission?.id,
      },
    })

    res.status(201).json(permission)
  }

  update = async (req: Request, res: Response) => {
    const permission = await this.permissionService.update({
      id: req.params.id as string,
      data: req.body,
    })

    if (!permission) {
      throw new AppError({
        message: 'Permiso no encontrado',
        statusCode: 404,
        code: 'PERMISSION_NOT_FOUND',
      })
    }

    await AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action: 'permissions.update',
        entityType: 'permission',
        entityId: permission.id,
      },
    })

    res.json(permission)
  }

  activate = async (req: Request, res: Response) => {
    const permission = await this.permissionService.setActive({
      id: req.params.id as string,
      isActive: true,
    })

    res.json(permission)
  }

  deactivate = async (req: Request, res: Response) => {
    const permission = await this.permissionService.setActive({
      id: req.params.id as string,
      isActive: false,
    })

    res.json(permission)
  }
}

