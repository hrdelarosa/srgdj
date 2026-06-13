import { AuditModel } from './audit.model.js'
import type { AuditQuery } from './audit.schema.js'

export class AuditService {
  static create = AuditModel.create

  static findAll(query: AuditQuery) {
    return AuditModel.findAll(query)
  }
}

