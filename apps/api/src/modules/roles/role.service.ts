import { RoleModel } from './role.model.js'
import type {
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from './role.schema.js'

export class RoleService {
  private readonly roleModel: typeof RoleModel

  constructor({ roleModel }: { roleModel: typeof RoleModel }) {
    this.roleModel = roleModel
  }

  findAll = async () => {
    return this.roleModel.findAll()
  }

  findById = async ({ id }: { id: string }) => {
    return this.roleModel.findById({ id })
  }

  create = async ({ data }: { data: CreateRoleInput }) => {
    return this.roleModel.create({ data })
  }

  update = async ({ id, data }: { id: string; data: UpdateRoleInput }) => {
    return this.roleModel.update({ id, data })
  }

  setActive = async ({ id, isActive }: { id: string; isActive: boolean }) => {
    return this.roleModel.setActive({ id, isActive })
  }

  findPermissions = async ({ id }: { id: string }) => {
    return this.roleModel.findPermissionsByRoleId({ id })
  }

  updatePermissions = async ({
    id,
    data,
  }: {
    id: string
    data: UpdateRolePermissionsInput
  }) => {
    return this.roleModel.updatePermissions({ id, data })
  }
}
