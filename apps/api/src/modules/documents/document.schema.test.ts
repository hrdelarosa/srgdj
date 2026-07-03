import { describe, expect, it } from 'vitest'
import { findAllDocumentsQuerySchema } from '@srgdj/shared'

describe('findAllDocumentsQuerySchema', () => {
  it('aplica valores por defecto cuando no hay query params', () => {
    expect(findAllDocumentsQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 30,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('convierte strings de query params a números', () => {
    expect(
      findAllDocumentsQuerySchema.parse({ page: '2', pageSize: '15' }),
    ).toEqual({
      page: 2,
      pageSize: 15,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('normaliza q vacío a undefined', () => {
    expect(findAllDocumentsQuerySchema.parse({ q: '' })).toEqual({
      page: 1,
      pageSize: 30,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('acepta filtros opcionales', () => {
    const currentStatusId = '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f'
    const documentTypeId = '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001'

    expect(
      findAllDocumentsQuerySchema.parse({
        q: 'González',
        currentStatusId,
        documentTypeId,
        sortBy: 'officeDate',
        sortOrder: 'asc',
      }),
    ).toEqual({
      page: 1,
      pageSize: 30,
      q: 'González',
      currentStatusId,
      documentTypeId,
      sortBy: 'officeDate',
      sortOrder: 'asc',
    })
  })
})
