import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { auditLogs, users } from '../../database/schema.js'
import type { AuditQuery } from './audit.schema.js'

export class AuditModel {
  static async create({
    data,
  }: {
    data: {
      actorUserId?: string | null
      action: string
      entityType: string
      entityId?: string | null
      metadata?: Record<string, unknown>
      ip?: string | null
      userAgent?: string | null
    }
  }) {
    await db.insert(auditLogs).values({
      actorUserId: data.actorUserId ?? null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId ?? null,
      metadata: data.metadata ?? {},
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
    })
  }

  static async findAll(query: AuditQuery) {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 30
    const offset = (page - 1) * pageSize
    const filters = [
      query.action ? eq(auditLogs.action, query.action) : undefined,
      query.entityType ? eq(auditLogs.entityType, query.entityType) : undefined,
      query.actorUserId ? eq(auditLogs.actorUserId, query.actorUserId) : undefined,
      query.dateFrom ? gte(auditLogs.createdAt, query.dateFrom) : undefined,
      query.dateTo ? lte(auditLogs.createdAt, query.dateTo) : undefined,
    ].filter(Boolean)
    const where = filters.length ? and(...filters) : undefined

    const items = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        ip: auditLogs.ip,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        actor: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorUserId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset(offset)

    const [totalResult] = await db
      .select({ total: count() })
      .from(auditLogs)
      .where(where)

    return {
      items,
      page,
      pageSize,
      total: totalResult?.total ?? 0,
      totalPages: Math.ceil((totalResult?.total ?? 0) / pageSize),
    }
  }
}

