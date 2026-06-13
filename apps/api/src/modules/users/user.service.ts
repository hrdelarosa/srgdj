import argon2 from 'argon2'
import { UserModel } from './user.model.js'
import { CreateUserInput, UpdateUserInput } from './user.schema.js'
import { AppError } from '../../utils/errors/app-error.js'
import { AuthUser } from '../auth/auth.type.js'

export class UserService {
  private userModel: typeof UserModel

  constructor({ userModel }: { userModel: typeof UserModel }) {
    this.userModel = userModel
  }

  findAll = async () => {
    return this.userModel.findAll()
  }

  findById = async ({ id }: { id: string }) => {
    return this.userModel.findById({ id })
  }

  create = async ({
    data,
    currentUser,
  }: {
    data: CreateUserInput
    currentUser: AuthUser
  }) => {
    const existingUser = await this.userModel.findByUsername({
      username: data.username,
    })

    if (existingUser) {
      throw new AppError({
        message: 'El username ya existe',
        statusCode: 409,
        code: 'USERNAME_ALREADY_EXISTS',
      })
    }

    const role = await this.userModel.findRoleById({ roleId: data.roleId })

    if (!role) {
      throw new AppError({
        message: 'El rol no existe',
        statusCode: 404,
        code: 'ROLE_NOT_FOUND',
      })
    }

    if (currentUser.role.code === 'JEFE_AREA' && role.code !== 'USUARIO') {
      throw new AppError({
        message: 'Solo se puedes crear usuarios normales',
        statusCode: 403,
        code: 'ROLE_ASSIGNMENT_NOT_ALLOWED',
      })
    }

    const passwordHash = await argon2.hash(data.password)

    return this.userModel.create({
      data: {
        username: data.username,
        passwordHash,
        fullName: data.fullName,
        roleId: data.roleId,
        isActive: data.isActive ?? true,
        mustChangePassword: data.mustChangePassword ?? true,
        createdByUserId: currentUser.id,
      },
    })
  }

  update = async ({ id, data }: { id: string; data: UpdateUserInput }) => {
    return this.userModel.update({
      id,
      data,
    })
  }

  setActive = async ({ id, isActive }: { id: string; isActive: boolean }) => {
    return this.userModel.setActive({
      id,
      isActive,
    })
  }
}
