import { z } from 'zod'

export const loginFormSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export type LoginFormInput = z.infer<typeof loginFormSchema>
