import { DocumentCatalogModel } from './document-catalog.model.js'

export class DocumentCatalogService {
  private readonly documentCatalogModel: typeof DocumentCatalogModel

  constructor({
    documentCatalogModel,
  }: {
    documentCatalogModel: typeof DocumentCatalogModel
  }) {
    this.documentCatalogModel = documentCatalogModel
  }

  findDocumentTypes = async () => {
    return this.documentCatalogModel.findDocumentTypes()
  }

  findDocumentStatuses = async () => {
    return this.documentCatalogModel.findDocumentStatuses()
  }
}
