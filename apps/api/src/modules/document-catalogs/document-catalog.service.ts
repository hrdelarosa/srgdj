import { DocumentCatalogModel } from './document-catalog.model.js'
import { AppError } from '../../utils/errors/app-error.js'
import { isMysqlDuplicateEntryError } from '../../utils/errors/mysql-errors.js'
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

  findDocumentTypeById = async ({ id }: { id: string }) => {
    return this.documentCatalogModel.findDocumentTypeById({ id })
  }

  findAllDocumentTypes = async () =>
    this.documentCatalogModel.findAllDocumentTypes()

  createDocumentType = async ({ data }: { data: CreateDocumentTypeInput }) => {
    await this.ensureDocumentTypeIsUnique({ data })

    try {
      return await this.documentCatalogModel.createDocumentType({ data })
    } catch (error) {
      this.throwDuplicateCatalogError({
        error,
        message: 'Ya existe un tipo de documento con el mismo código o nombre',
        code: 'DOCUMENT_TYPE_ALREADY_EXISTS',
      })
    }
  }

  updateDocumentType = async ({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentTypeInput
  }) => {
    await this.ensureDocumentTypeIsUnique({ data, currentId: id })

    try {
      return await this.documentCatalogModel.updateDocumentType({ id, data })
    } catch (error) {
      this.throwDuplicateCatalogError({
        error,
        message: 'Ya existe un tipo de documento con el mismo código o nombre',
        code: 'DOCUMENT_TYPE_ALREADY_EXISTS',
      })
    }
  }

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

  findDocumentStatusById = async ({ id }: { id: string }) => {
    return this.documentCatalogModel.findDocumentStatusById({ id })
  }

  findAllDocumentStatuses = async () =>
    this.documentCatalogModel.findAllDocumentStatuses()

  createDocumentStatus = async ({
    data,
  }: {
    data: CreateDocumentStatusInput
  }) => {
    await this.ensureDocumentStatusIsUnique({ data })

    try {
      return await this.documentCatalogModel.createDocumentStatus({ data })
    } catch (error) {
      this.throwDuplicateCatalogError({
        error,
        message: 'Ya existe un estatus con el mismo código o nombre',
        code: 'DOCUMENT_STATUS_ALREADY_EXISTS',
      })
    }
  }

  updateDocumentStatus = async ({
    id,
    data,
  }: {
    id: string
    data: UpdateDocumentStatusInput
  }) => {
    await this.ensureDocumentStatusIsUnique({ data, currentId: id })

    try {
      return await this.documentCatalogModel.updateDocumentStatus({ id, data })
    } catch (error) {
      this.throwDuplicateCatalogError({
        error,
        message: 'Ya existe un estatus con el mismo código o nombre',
        code: 'DOCUMENT_STATUS_ALREADY_EXISTS',
      })
    }
  }

  setDocumentStatusActive = async ({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) => this.documentCatalogModel.setDocumentStatusActive({ id, isActive })

  findPhysicalLocations = async () =>
    this.documentCatalogModel.findPhysicalLocations()

  findPhysicalLocationById = async ({ id }: { id: string }) =>
    this.documentCatalogModel.findPhysicalLocationById({ id })

  findAllPhysicalLocations = async () =>
    this.documentCatalogModel.findAllPhysicalLocations()

  createPhysicalLocation = async ({
    data,
  }: {
    data: CreatePhysicalLocationInput
  }) => {
    await this.ensurePhysicalLocationIsUnique({ data })

    return this.documentCatalogModel.createPhysicalLocation({ data })
  }

  updatePhysicalLocation = async ({
    id,
    data,
  }: {
    id: string
    data: UpdatePhysicalLocationInput
  }) => {
    await this.ensurePhysicalLocationIsUnique({ data, currentId: id })

    return this.documentCatalogModel.updatePhysicalLocation({ id, data })
  }

  setPhysicalLocationActive = async ({
    id,
    isActive,
  }: {
    id: string
    isActive: boolean
  }) => this.documentCatalogModel.setPhysicalLocationActive({ id, isActive })

  private normalizeCatalogValue(value: string | undefined) {
    return value?.trim().toLocaleLowerCase()
  }

  private throwDuplicateCatalogError({
    error,
    message,
    code,
  }: {
    error: unknown
    message: string
    code: string
  }): never {
    if (isMysqlDuplicateEntryError(error)) {
      throw new AppError({
        message,
        statusCode: 409,
        code,
      })
    }

    throw error
  }

  private async ensureDocumentTypeIsUnique({
    data,
    currentId,
  }: {
    data: Partial<CreateDocumentTypeInput>
    currentId?: string
  }) {
    if (!data.code && !data.name) return

    const code = this.normalizeCatalogValue(data.code)
    const name = this.normalizeCatalogValue(data.name)
    const items = await this.documentCatalogModel.findAllDocumentTypes()
    const duplicate = items.some(
      (item) =>
        item.id !== currentId &&
        ((code && this.normalizeCatalogValue(item.code) === code) ||
          (name && this.normalizeCatalogValue(item.name) === name)),
    )

    if (duplicate) {
      throw new AppError({
        message: 'Ya existe un tipo de documento con el mismo código o nombre',
        statusCode: 409,
        code: 'DOCUMENT_TYPE_ALREADY_EXISTS',
      })
    }
  }

  private async ensureDocumentStatusIsUnique({
    data,
    currentId,
  }: {
    data: Partial<CreateDocumentStatusInput>
    currentId?: string
  }) {
    if (!data.code && !data.name) return

    const code = this.normalizeCatalogValue(data.code)
    const name = this.normalizeCatalogValue(data.name)
    const items = await this.documentCatalogModel.findAllDocumentStatuses()
    const duplicate = items.some(
      (item) =>
        item.id !== currentId &&
        ((code && this.normalizeCatalogValue(item.code) === code) ||
          (name && this.normalizeCatalogValue(item.name) === name)),
    )

    if (duplicate) {
      throw new AppError({
        message: 'Ya existe un estatus con el mismo código o nombre',
        statusCode: 409,
        code: 'DOCUMENT_STATUS_ALREADY_EXISTS',
      })
    }
  }

  private async ensurePhysicalLocationIsUnique({
    data,
    currentId,
  }: {
    data: Partial<CreatePhysicalLocationInput>
    currentId?: string
  }) {
    if (!data.name) return

    const name = this.normalizeCatalogValue(data.name)
    const items = await this.documentCatalogModel.findAllPhysicalLocations()
    const duplicate = items.some(
      (item) =>
        item.id !== currentId && this.normalizeCatalogValue(item.name) === name,
    )

    if (duplicate) {
      throw new AppError({
        message: 'Ya existe una ubicación física con el mismo nombre',
        statusCode: 409,
        code: 'PHYSICAL_LOCATION_ALREADY_EXISTS',
      })
    }
  }
}
