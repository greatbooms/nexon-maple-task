import { UserRole } from '../enum'

export interface JwtPayload {
  id: string
  role: keyof typeof UserRole
  email: string
}
