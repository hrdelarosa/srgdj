import { RoleModel } from './role.model.js'

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
}
