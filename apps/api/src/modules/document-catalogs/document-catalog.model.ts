import { asc, eq } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import { db } from '../../database/db.js'
import {
  documentStatuses,
  documentTypes,
  physicalLocations,
} from '../../database/schema.js'
import type {
  CreateDocumentStatusInput,
  CreateDocumentTypeInput,
  CreatePhysicalLocationInput,
  UpdateDocumentStatusInput,
  UpdateDocumentTypeInput,
  UpdatePhysicalLocationInput,
} from './document-catalog.schema.js'

export class DocumentCatalogModel {
  static async findDocumentTypes() {
    return db
      .select({
        id: documentTypes.id,
        code: documentTypes.code,
        name: documentTypes.name,
        description: documentTypes.description,
      })
      .from(documentTypes)
      .where(eq(documentTypes.isActive, true))
      .orderBy(asc(documentTypes.name))
  }

  static async findAllDocumentTypes() {
    return db.select().from(documentTypes).orderBy(asc(documentTypes.name))
  }

  static async createDocumentType({ data }: { data: CreateDocumentTypeInput }) {
    const id = uuidv7()
    await db.insert(documentTypes).values({
      id,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    })
    return this.findDocumentTypeById({ id })
  }

  static async updateDocumentType({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentTypeInput
  }) {
    await db.update(documentTypes).set(data).where(eq(documentTypes.id, id))
    return this.findDocumentTypeById({ id })
  }

  static async findDocumentTypeById({ id }: { id: string }) {
    const [item] = await db
      .select()
      .from(documentTypes)
      .where(eq(documentTypes.id, id))
      .limit(1)
    return item ?? null
  }

  static async setDocumentTypeActive({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) {
    await db.update(documentTypes).set({ isActive }).where(eq(documentTypes.id, id))
    return this.findDocumentTypeById({ id })
  }

  static async findDocumentStatuses() {
    return db
      .select({
        id: documentStatuses.id,
        code: documentStatuses.code,
        name: documentStatuses.name,
        description: documentStatuses.description,
        sortOrder: documentStatuses.sortOrder,
        isTerminal: documentStatuses.isTerminal,
      })
      .from(documentStatuses)
      .where(eq(documentStatuses.isActive, true))
      .orderBy(asc(documentStatuses.name))
  }

  static async findAllDocumentStatuses() {
    return db
      .select()
      .from(documentStatuses)
      .orderBy(asc(documentStatuses.sortOrder))
  }

  static async createDocumentStatus({
    data,
  }: {
    data: CreateDocumentStatusInput
  }) {
    const id = uuidv7()
    await db.insert(documentStatuses).values({
      id,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
      isTerminal: data.isTerminal ?? false,
      isActive: data.isActive ?? true,
    })
    return this.findDocumentStatusById({ id })
  }

  static async updateDocumentStatus({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentStatusInput
  }) {
    await db
      .update(documentStatuses)
      .set(data)
      .where(eq(documentStatuses.id, id))
    return this.findDocumentStatusById({ id })
  }

  static async findDocumentStatusById({ id }: { id: string }) {
    const [item] = await db
      .select()
      .from(documentStatuses)
      .where(eq(documentStatuses.id, id))
      .limit(1)
    return item ?? null
  }

  static async setDocumentStatusActive({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) {
    await db
      .update(documentStatuses)
      .set({ isActive })
      .where(eq(documentStatuses.id, id))
    return this.findDocumentStatusById({ id })
  }

  static async findPhysicalLocations() {
    return db
      .select()
      .from(physicalLocations)
      .where(eq(physicalLocations.isActive, true))
      .orderBy(asc(physicalLocations.name))
  }

  static async findAllPhysicalLocations() {
    return db.select().from(physicalLocations).orderBy(asc(physicalLocations.name))
  }

  static async createPhysicalLocation({
    data,
  }: {
    data: CreatePhysicalLocationInput
  }) {
    const id = uuidv7()
    await db.insert(physicalLocations).values({
      id,
      name: data.name,
      drawer: data.drawer ?? null,
      reference: data.reference ?? null,
      isActive: data.isActive ?? true,
    })
    return this.findPhysicalLocationById({ id })
  }

  static async updatePhysicalLocation({
    id,
    data,
  }: {
    id: string
    data: UpdatePhysicalLocationInput
  }) {
    await db
      .update(physicalLocations)
      .set(data)
      .where(eq(physicalLocations.id, id))
    return this.findPhysicalLocationById({ id })
  }

  static async findPhysicalLocationById({ id }: { id: string }) {
    const [item] = await db
      .select()
      .from(physicalLocations)
      .where(eq(physicalLocations.id, id))
      .limit(1)
    return item ?? null
  }

  static async setPhysicalLocationActive({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) {
    await db
      .update(physicalLocations)
      .set({ isActive })
      .where(eq(physicalLocations.id, id))
    return this.findPhysicalLocationById({ id })
  }
}
