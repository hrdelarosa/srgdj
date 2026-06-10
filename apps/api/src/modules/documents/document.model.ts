import { v7 as uuidv7 } from 'uuid'
import { db } from '../../database/db.js'
import { DocumentUpdate } from './document.type.js'
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNull,
  like,
  lte,
  or,
} from 'drizzle-orm'
import {
  CreateDocumentModelInput,
  DocumentListItem,
  FindAllDocumentsParams,
  PaginatedResponse,
  UpdateDocumentModelInput,
} from '@srgdj/shared'
import {
  documentEvents,
  documents,
  documentStatuses,
  documentTypes,
  physicalLocations,
  users,
} from '../../database/schema.js'
import { CreateDocumentEventInput, DocumentQuery } from './document.schema.js'
import { alias } from 'drizzle-orm/mysql-core'

const fromStatus = alias(documentStatuses, 'from_status')
const toStatus = alias(documentStatuses, 'to_status')

export class DocumentModel {
  static async findAll({
    page,
    pageSize,
    ...rest
  }: DocumentQuery): Promise<PaginatedResponse<DocumentListItem>> {
    const currentPage = page ?? 1
    const limit = pageSize ?? 30
    const offset = (currentPage - 1) * limit
    const query = { ...rest }

    const filters = [
      isNull(documents.deletedAt),

      query.q
        ? or(
            like(documents.officeNumber, `%${query.q}%`),
            like(documents.caseNumber, `%${query.q}%`),
            like(documents.actor, `%${query.q}%`),
            like(documents.defendant, `%${query.q}%`),
          )
        : undefined,
      query.documentTypeId
        ? eq(documents.documentTypeId, query.documentTypeId)
        : undefined,
      query.currentStatusId
        ? eq(documents.currentStatusId, query.currentStatusId)
        : undefined,
      query.receivedDateFrom
        ? gte(documents.receivedDate, query.receivedDateFrom)
        : undefined,
      query.receivedDateTo
        ? lte(documents.receivedDate, query.receivedDateTo)
        : undefined,
    ].filter(Boolean)

    const where = and(...filters)

    const orderColumn = {
      officeDate: documents.officeDate,
      receivedDate: documents.receivedDate,
      documentType: documentTypes.name,
      status: documentStatuses.name,
      createdAt: documents.createdAt,
    }[query.sortBy]
    const orderBy =
      query.sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn)

    const items = await db
      .select({
        id: documents.id,
        officeNumber: documents.officeNumber,
        caseNumber: documents.caseNumber,
        actor: documents.actor,
        defendant: documents.defendant,
        officeDate: documents.officeDate,
        receivedDate: documents.receivedDate,
        annexes: documents.annexes,
        observations: documents.observations,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,

        documentType: {
          id: documentTypes.id,
          code: documentTypes.code,
          name: documentTypes.name,
        },

        currentStatus: {
          id: documentStatuses.id,
          code: documentStatuses.code,
          name: documentStatuses.name,
        },

        physicalLocation: {
          id: physicalLocations.id,
          name: physicalLocations.name,
          drawer: physicalLocations.drawer,
          reference: physicalLocations.reference,
        },
        createdBy: {
          id: documents.createdBy,
          name: users.username,
          fullName: users.fullName,
        },
      })
      .from(documents)
      .innerJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .innerJoin(
        documentStatuses,
        eq(documents.currentStatusId, documentStatuses.id),
      )
      .innerJoin(users, eq(documents.createdBy, users.id))
      .leftJoin(
        physicalLocations,
        eq(documents.physicalLocationId, physicalLocations.id),
      )
      .where(where)
      .orderBy(desc(documents.receivedDate))
      .limit(limit)
      .offset(offset)

    const [totalResult] = await db
      .select({
        total: count(),
      })
      .from(documents)
      .where(where)

    const total = totalResult?.total ?? 0

    return {
      items,
      page: currentPage,
      pageSize: limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    }
  }

  static async findById({ id }: { id: string }) {
    const [document] = await db
      .select({
        id: documents.id,
        officeNumber: documents.officeNumber,
        caseNumber: documents.caseNumber,
        actor: documents.actor,
        defendant: documents.defendant,
        officeDate: documents.officeDate,
        receivedDate: documents.receivedDate,
        annexes: documents.annexes,
        observations: documents.observations,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,

        documentType: {
          id: documentTypes.id,
          code: documentTypes.code,
          name: documentTypes.name,
        },

        currentStatus: {
          id: documentStatuses.id,
          code: documentStatuses.code,
          name: documentStatuses.name,
        },

        physicalLocation: {
          id: physicalLocations.id,
          name: physicalLocations.name,
          drawer: physicalLocations.drawer,
          reference: physicalLocations.reference,
        },
        createdBy: {
          id: documents.createdBy,
          name: users.username,
          fullName: users.fullName,
        },
      })
      .from(documents)
      .innerJoin(documentTypes, eq(documents.documentTypeId, documentTypes.id))
      .innerJoin(
        documentStatuses,
        eq(documents.currentStatusId, documentStatuses.id),
      )
      .innerJoin(users, eq(documents.createdBy, users.id))
      .leftJoin(
        physicalLocations,
        eq(documents.physicalLocationId, physicalLocations.id),
      )
      .where(and(eq(documents.id, id), isNull(documents.deletedAt)))

    if (!document) return null

    const events = await db
      .select({
        id: documentEvents.id,
        eventType: documentEvents.eventType,
        note: documentEvents.note,
        metadata: documentEvents.metadata,
        createdAt: documentEvents.createdAt,
        fromStatus: {
          id: fromStatus.id,
          code: fromStatus.code,
          name: fromStatus.name,
        },
        toStatus: {
          id: toStatus.id,
          code: toStatus.code,
          name: toStatus.name,
        },
      })
      .from(documentEvents)
      .leftJoin(fromStatus, eq(documentEvents.fromStatusId, fromStatus.id))
      .leftJoin(toStatus, eq(documentEvents.toStatusId, toStatus.id))
      .where(eq(documentEvents.documentId, id))
      .orderBy(desc(documentEvents.createdAt))

    return {
      ...document,
      events,
    }
  }

  static async findByOfficeNumber({ officeNumber }: { officeNumber: string }) {
    const [document] = await db
      .select({
        id: documents.id,
        officeNumber: documents.officeNumber,
        caseNumber: documents.caseNumber,
        actor: documents.actor,
        defendant: documents.defendant,
        officeDate: documents.officeDate,
        receivedDate: documents.receivedDate,
        annexes: documents.annexes,
        observations: documents.observations,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.officeNumber, officeNumber))

    return document || null
  }

  static async create({
    document,
  }: {
    document: CreateDocumentModelInput
  }): Promise<DocumentListItem | null> {
    const documentId = uuidv7()

    await db.transaction(async (tx) => {
      await tx.insert(documents).values({
        id: documentId,
        officeNumber: document.officeNumber,
        caseNumber: document.caseNumber ?? null,
        actor: document.actor ?? null,
        defendant: document.defendant ?? null,
        documentTypeId: document.documentTypeId,
        officeDate: document.officeDate ? new Date(document.officeDate) : null,
        receivedDate: new Date(document.receivedDate),
        annexes: document.annexes ?? null,
        physicalLocationId: document.physicalLocationId ?? null,
        currentStatusId: document.currentStatusId,
        observations: document.observations ?? null,
        createdBy: document.userId,
        updatedBy: document.userId,
      })

      await tx.insert(documentEvents).values({
        documentId,
        eventType: 'CREATED',
        fromStatusId: null,
        toStatusId: document.currentStatusId,
        note: 'Documento registrado en el sistema',
        metadata: {},
        createdBy: document.userId,
      })
    })

    return this.findById({ id: documentId })
  }

  static async update({
    id,
    document,
  }: {
    id: string
    document: UpdateDocumentModelInput
  }): Promise<DocumentListItem | null> {
    const [currentDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!currentDocument) return null

    const updatedFields: DocumentUpdate = {
      updatedBy: document.userId,
      updatedAt: new Date(),
    }

    if (document.officeNumber !== undefined)
      updatedFields.officeNumber = document.officeNumber
    if (document.caseNumber !== undefined)
      updatedFields.caseNumber = document.caseNumber ?? null
    if (document.actor !== undefined)
      updatedFields.actor = document.actor ?? null
    if (document.defendant !== undefined)
      updatedFields.defendant = document.defendant ?? null
    if (document.documentTypeId !== undefined)
      updatedFields.documentTypeId = document.documentTypeId
    if (document.officeDate !== undefined) {
      updatedFields.officeDate = document.officeDate
        ? new Date(document.officeDate)
        : null
    }
    if (document.receivedDate !== undefined)
      updatedFields.receivedDate = new Date(document.receivedDate)
    if (document.annexes !== undefined)
      updatedFields.annexes = document.annexes ?? null
    if (document.physicalLocationId !== undefined)
      updatedFields.physicalLocationId = document.physicalLocationId ?? null
    if (document.currentStatusId !== undefined)
      updatedFields.currentStatusId = document.currentStatusId
    if (document.observations !== undefined)
      updatedFields.observations = document.observations ?? null

    const statusChanged =
      document.currentStatusId !== undefined &&
      document.currentStatusId !== currentDocument.currentStatusId

    await db.transaction(async (tx) => {
      await tx.update(documents).set(updatedFields).where(eq(documents.id, id))

      if (statusChanged) {
        await tx.insert(documentEvents).values({
          documentId: id,
          eventType: 'STATUS_CHANGED',
          fromStatusId: currentDocument.currentStatusId,
          toStatusId: document.currentStatusId,
          note: 'Estado del documento actualizado',
          metadata: {
            previousStatusId: currentDocument.currentStatusId,
            newStatusId: document.currentStatusId,
          },
          createdBy: document.userId,
        })

        return
      }

      await tx.insert(documentEvents).values({
        documentId: id,
        eventType: 'UPDATED',
        note: 'Documento actualizado',
        metadata: {
          changedFields: Object.keys(updatedFields).filter(
            (key) => key !== 'userId',
          ),
        },
        createdBy: document.userId,
      })
    })

    return this.findById({ id })
  }

  static async delete({ id, userId }: { id: string; userId: string }) {
    const currentDocument = await this.findById({ id })

    if (!currentDocument) return null

    await db.transaction(async (tx) => {
      await tx
        .update(documents)
        .set({ deletedAt: new Date(), updatedBy: userId })
        .where(eq(documents.id, id))
    })

    await db.insert(documentEvents).values({
      documentId: id,
      eventType: 'DELETED',
      note: 'Documento eliminado',
      metadata: {},
      createdBy: userId,
    })

    return true
  }

  static async remove({ id }: { id: string }) {
    const currentDocument = await this.findById({ id })

    if (!currentDocument) return null

    await db.delete(documents).where(eq(documents.id, id))

    return true
  }

  static async findEventsByDocumentId({ id }: { id: string }) {
    return await db
      .select({
        id: documentEvents.id,
        eventType: documentEvents.eventType,
        note: documentEvents.note,
        metadata: documentEvents.metadata,
        createdAt: documentEvents.createdAt,

        fromStatus: {
          id: fromStatus.id,
          code: fromStatus.code,
          name: fromStatus.name,
        },

        toStatus: {
          id: toStatus.id,
          code: toStatus.code,
          name: toStatus.name,
        },
      })
      .from(documentEvents)
      .leftJoin(fromStatus, eq(documentEvents.fromStatusId, fromStatus.id))
      .leftJoin(toStatus, eq(documentEvents.toStatusId, toStatus.id))
      .where(eq(documentEvents.documentId, id))
      .orderBy(desc(documentEvents.createdAt))
  }

  static async createEvent({
    id,
    data,
  }: {
    id: string
    data: CreateDocumentEventInput
  }) {
    const [currentDocument] = await db
      .select({
        id: documents.id,
        currentStatusId: documents.currentStatusId,
        physicalLocationId: documents.physicalLocationId,
      })
      .from(documents)
      .where(and(eq(documents.id, id), isNull(documents.deletedAt)))
      .limit(1)

    if (!currentDocument) return null

    const createdEvent = await db.transaction(async (tx) => {
      if (data.eventType === 'STATUS_CHANGED') {
        if (!data.toStatusId) {
          throw new Error('toStatusId is required for STATUS_CHANGED')
        }

        await tx
          .update(documents)
          .set({
            currentStatusId: data.toStatusId,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, id))
      }

      const eventId = uuidv7()

      await tx.insert(documentEvents).values({
        id: eventId,
        documentId: id,
        eventType: data.eventType,
        fromStatusId:
          data.eventType === 'STATUS_CHANGED'
            ? currentDocument.currentStatusId
            : null,
        toStatusId:
          data.eventType === 'STATUS_CHANGED' ? data.toStatusId : null,
        note: data.note ?? null,
        metadata: data.metadata ?? {},
        createdBy: '019eaa17-b4cc-75af-bcac-6f20f12451ef',
      })

      const [event] = await tx
        .select()
        .from(documentEvents)
        .where(eq(documentEvents.id, eventId))
        .limit(1)

      return event
    })

    return createdEvent
  }
}
