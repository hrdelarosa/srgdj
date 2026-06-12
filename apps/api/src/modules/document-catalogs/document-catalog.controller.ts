import type { Request, Response } from 'express'
import { DocumentCatalogModel } from './document-catalog.model.js'
import { DocumentCatalogService } from './document-catalog.service.js'

export class DocumentCatalogController {
  private readonly documentCatalogService: DocumentCatalogService

  constructor({
    documentCatalogModel,
  }: {
    documentCatalogModel: typeof DocumentCatalogModel
  }) {
    this.documentCatalogService = new DocumentCatalogService({
      documentCatalogModel,
    })
  }

  findDocumentTypes = async (req: Request, res: Response) => {
    const items = await this.documentCatalogService.findDocumentTypes()

    res.json({ items })
  }

  findDocumentStatuses = async (req: Request, res: Response) => {
    const items = await this.documentCatalogService.findDocumentStatuses()

    res.json({ items })
  }
}
