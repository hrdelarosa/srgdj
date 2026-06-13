import type { Request, Response } from 'express'
import { DocumentCatalogModel } from './document-catalog.model.js'
import { DocumentCatalogService } from './document-catalog.service.js'
import { AuditService } from '../audit/audit.service.js'

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
    const includeInactive = req.query.includeInactive === 'true'
    const items = includeInactive
      ? await this.documentCatalogService.findAllDocumentTypes()
      : await this.documentCatalogService.findDocumentTypes()

    res.json({ items })
  }

  findDocumentStatuses = async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true'
    const items = includeInactive
      ? await this.documentCatalogService.findAllDocumentStatuses()
      : await this.documentCatalogService.findDocumentStatuses()

    res.json({ items })
  }

  createDocumentType = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.createDocumentType({
      data: req.body,
    })
    await this.audit(req, 'catalog.document_types.create', item?.id)
    res.status(201).json(item)
  }

  updateDocumentType = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.updateDocumentType({
      id: req.params.id as string,
      data: req.body,
    })
    await this.audit(req, 'catalog.document_types.update', item?.id)
    res.json(item)
  }

  activateDocumentType = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.setDocumentTypeActive({
      id: req.params.id as string,
      isActive: true,
    })
    res.json(item)
  }

  deactivateDocumentType = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.setDocumentTypeActive({
      id: req.params.id as string,
      isActive: false,
    })
    res.json(item)
  }

  createDocumentStatus = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.createDocumentStatus({
      data: req.body,
    })
    await this.audit(req, 'catalog.document_statuses.create', item?.id)
    res.status(201).json(item)
  }

  updateDocumentStatus = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.updateDocumentStatus({
      id: req.params.id as string,
      data: req.body,
    })
    await this.audit(req, 'catalog.document_statuses.update', item?.id)
    res.json(item)
  }

  activateDocumentStatus = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.setDocumentStatusActive({
      id: req.params.id as string,
      isActive: true,
    })
    res.json(item)
  }

  deactivateDocumentStatus = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.setDocumentStatusActive({
      id: req.params.id as string,
      isActive: false,
    })
    res.json(item)
  }

  findPhysicalLocations = async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true'
    const items = includeInactive
      ? await this.documentCatalogService.findAllPhysicalLocations()
      : await this.documentCatalogService.findPhysicalLocations()

    res.json({ items })
  }

  createPhysicalLocation = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.createPhysicalLocation({
      data: req.body,
    })
    await this.audit(req, 'catalog.physical_locations.create', item?.id)
    res.status(201).json(item)
  }

  updatePhysicalLocation = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.updatePhysicalLocation({
      id: req.params.id as string,
      data: req.body,
    })
    await this.audit(req, 'catalog.physical_locations.update', item?.id)
    res.json(item)
  }

  activatePhysicalLocation = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.setPhysicalLocationActive({
      id: req.params.id as string,
      isActive: true,
    })
    res.json(item)
  }

  deactivatePhysicalLocation = async (req: Request, res: Response) => {
    const item = await this.documentCatalogService.setPhysicalLocationActive({
      id: req.params.id as string,
      isActive: false,
    })
    res.json(item)
  }

  private audit(req: Request, action: string, entityId?: string) {
    return AuditService.create({
      data: {
        actorUserId: req.user?.id,
        action,
        entityType: 'catalog',
        entityId,
      },
    })
  }
}
