import { describe, expect, it } from 'vitest'
import { findAllDocumentsQuerySchema } from '@srgdj/shared'

describe('findAllDocumentsQuerySchema', () => {
  it('aplica valores por defecto cuando no hay query params', () => {
    expect(findAllDocumentsQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 30,
    })
  })

  it('convierte strings de query params a números', () => {
    expect(
      findAllDocumentsQuerySchema.parse({ page: '2', pageSize: '15' }),
    ).toEqual({
      page: 2,
      pageSize: 15,
    })
  })

  it('normaliza query vacío a undefined', () => {
    expect(findAllDocumentsQuerySchema.parse({ query: '' })).toEqual({
      page: 1,
      pageSize: 30,
    })
  })

  it('acepta filtros opcionales', () => {
    const statusId = '019e9bc2-a9d0-72f2-a385-2c5d1dd3310f'
    const documentTypeId = '019e9bc2-a9cd-74e0-bcc6-89bd3dd7c001'

    expect(
      findAllDocumentsQuerySchema.parse({
        query: 'González',
        statusId,
        documentTypeId,
      }),
    ).toEqual({
      page: 1,
      pageSize: 30,
      query: 'González',
      statusId,
      documentTypeId,
    })
  })
})
