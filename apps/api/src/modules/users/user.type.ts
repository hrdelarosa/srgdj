export type CreateUserData = {
  username: string
  passwordHash: string
  fullName: string
  roleId: string
  isActive: boolean
  mustChangePassword: boolean
  createdByUserId: string
}
