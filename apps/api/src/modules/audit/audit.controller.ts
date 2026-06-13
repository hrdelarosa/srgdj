import type { Request, Response } from 'express'
import { AuditService } from './audit.service.js'
import type { AuditQuery } from './audit.schema.js'

export class AuditController {
  findAll = async (req: Request, res: Response) => {
    const query = req.query as unknown as AuditQuery
    const result = await AuditService.findAll(query)

    res.json(result)
  }
}

