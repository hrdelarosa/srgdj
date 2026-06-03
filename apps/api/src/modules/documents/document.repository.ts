const documents = [
  {
    id: 1,
    officeNumber: 'INM-AJ-001/2026',
    caseNumber: 'EXP-001/2026',
    actor: 'Actor de ejemplo',
    defendant: 'Demandado de ejemplo',
    status: 'RECIBIDO',
  },
  {
    id: 2,
    officeNumber: 'INM-AJ-002/2026',
    caseNumber: 'EXP-002/2026',
    actor: 'Actor de ejemplo',
    defendant: 'Demandado de ejemplo',
    status: 'RECIBIDO',
  },
  {
    id: 3,
    officeNumber: 'INM-AJ-003/2026',
    caseNumber: 'EXP-003/2026',
    actor: 'Actor de ejemplo',
    defendant: 'Demandado de ejemplo',
    status: 'RECIBIDO',
  },
  {
    id: 4,
    officeNumber: 'INM-AJ-004/2026',
    caseNumber: 'EXP-004/2026',
    actor: 'Actor de ejemplo',
    defendant: 'Demandado de ejemplo',
    status: 'RECIBIDO',
  },
  {
    id: 5,
    officeNumber: 'INM-AJ-005/2026',
    caseNumber: 'EXP-005/2026',
    actor: 'Actor de ejemplo',
    defendant: 'Demandado de ejemplo',
    status: 'RECIBIDO',
  },
]

export const documentRepository = {
  async findAll() {
    return documents
  },

  async findById(id: number) {
    return documents.find((document) => document.id === id) ?? null
  },

  async create(data: unknown) {
    const document = {
      id: documents.length + 1,
      ...(data as object),
    }

    documents.push(document as (typeof documents)[number])

    return document
  },

  async update(id: number, data: unknown) {
    const index = documents.findIndex((document) => document.id === id)

    if (index === -1) {
      return null
    }

    const updatedDocument = {
      ...documents[index],
      ...(data as Partial<(typeof documents)[number]>),
    } as (typeof documents)[number]

    documents[index] = updatedDocument

    return updatedDocument
  },

  async remove(id: number) {
    const index = documents.findIndex((document) => document.id === id)

    if (index !== -1) {
      documents.splice(index, 1)
    }
  },
}
