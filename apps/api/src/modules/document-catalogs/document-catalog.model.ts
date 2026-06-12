import { asc, eq } from 'drizzle-orm'
import { db } from '../../database/db.js'
import { documentStatuses, documentTypes } from '../../database/schema.js'

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
}
