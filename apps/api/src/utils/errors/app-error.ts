export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor({
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
  }: {
    message: string
    statusCode: number
    code: string
  }) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}
