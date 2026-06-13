import { DocumentCatalogModel } from './document-catalog.model.js'
import type {
  CreateDocumentStatusInput,
  CreateDocumentTypeInput,
  CreatePhysicalLocationInput,
  UpdateDocumentStatusInput,
  UpdateDocumentTypeInput,
  UpdatePhysicalLocationInput,
} from './document-catalog.schema.js'

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

  findAllDocumentTypes = async () => this.documentCatalogModel.findAllDocumentTypes()

  createDocumentType = async ({ data }: { data: CreateDocumentTypeInput }) =>
    this.documentCatalogModel.createDocumentType({ data })

  updateDocumentType = async ({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentTypeInput
  }) => this.documentCatalogModel.updateDocumentType({ id, data })

  setDocumentTypeActive = async ({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) => this.documentCatalogModel.setDocumentTypeActive({ id, isActive })

  findDocumentStatuses = async () => {
    return this.documentCatalogModel.findDocumentStatuses()
  }

  findAllDocumentStatuses = async () =>
    this.documentCatalogModel.findAllDocumentStatuses()

  createDocumentStatus = async ({ data }: { data: CreateDocumentStatusInput }) =>
    this.documentCatalogModel.createDocumentStatus({ data })

  updateDocumentStatus = async ({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentStatusInput
  }) => this.documentCatalogModel.updateDocumentStatus({ id, data })

  setDocumentStatusActive = async ({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) => this.documentCatalogModel.setDocumentStatusActive({ id, isActive })

  findPhysicalLocations = async () =>
    this.documentCatalogModel.findPhysicalLocations()

  findAllPhysicalLocations = async () =>
    this.documentCatalogModel.findAllPhysicalLocations()

  createPhysicalLocation = async ({
    data,
  }: {
    data: CreatePhysicalLocationInput
  }) => this.documentCatalogModel.createPhysicalLocation({ data })

  updatePhysicalLocation = async ({
    id,
    data,
  }: {
    id: string
    data: UpdatePhysicalLocationInput
  }) => this.documentCatalogModel.updatePhysicalLocation({ id, data })

  setPhysicalLocationActive = async ({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) => this.documentCatalogModel.setPhysicalLocationActive({ id, isActive })
}
