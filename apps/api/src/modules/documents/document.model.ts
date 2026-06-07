import { v7 as uuidv7 } from 'uuid'
import { db } from '../../database/db.js'
import { DocumentUpdate } from './document.type.js'
import { and, count, desc, eq, isNull, like, or } from 'drizzle-orm'
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

export class DocumentModel {
  static async findAll({
    page,
    pageSize,
    query,
  }: FindAllDocumentsParams): Promise<PaginatedResponse<DocumentListItem>> {
    const currentPage = page ?? 1
    const limit = pageSize ?? 30
    const offset = (currentPage - 1) * limit
    const filters = [
      isNull(documents.deletedAt),
      query
        ? or(
            like(documents.officeNumber, `%${query}%`),
            like(documents.caseNumber, `%${query}%`),
            like(documents.actor, `%${query}%`),
            like(documents.defendant, `%${query}%`),
          )
        : undefined,
    ].filter(Boolean)

    const where = and(...filters)

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

    return {
      items,
      page: currentPage,
      pageSize: limit,
      total: totalResult?.total ?? 0,
    }
  }

  static async findById({
    id,
  }: {
    id: string
  }): Promise<DocumentListItem | null> {
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

    return document ?? null
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
    const currentDocument = await this.findById({ id })

    if (!currentDocument) return null

    const updatedFields: DocumentUpdate = { updatedBy: document.userId }

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

    await db.transaction(async (tx) => {
      await tx.update(documents).set(updatedFields).where(eq(documents.id, id))
    })

    await db.insert(documentEvents).values({
      documentId: id,
      eventType: 'UPDATED',
      note: 'Documento actualizado',
      metadata: document,
      createdBy: document.userId,
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
}
