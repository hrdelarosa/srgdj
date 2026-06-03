import { documentRepository } from './document.repository.js'

export const documentService = {
  async findAll() {
    return documentRepository.findAll()
  },

  async findById(id: number) {
    return documentRepository.findById(id)
  },

  async create(data: unknown) {
    return documentRepository.create(data)
  },

  async update(id: number, data: unknown) {
    return documentRepository.update(id, data)
  },

  async remove(id: number) {
    return documentRepository.remove(id)
  },
}
