import { AppError } from '../../utils/errors/app-error.js'
import { PermissionModel } from './permission.model.js'
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from './permission.schema.js'

export class PermissionService {
  findAll = async () => PermissionModel.findAll()

  findById = async ({ id }: { id: string }) => PermissionModel.findById({ id })

  create = async ({ data }: { data: CreatePermissionInput }) =>
    PermissionModel.create({ data: { ...data, isSystem: data.isSystem ?? false } })

  update = async ({ id, data }: { id: string; data: UpdatePermissionInput }) => {
    const permission = await PermissionModel.findById({ id })

    if (!permission) return null

    return PermissionModel.update({ id, data })
  }

  setActive = async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const permission = await PermissionModel.findById({ id })

    if (!permission) return null

    return PermissionModel.setActive({ id, isActive })
  }
}

