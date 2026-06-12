export interface ApiError {
  error: {
    message: string
    statusCode?: number
    code?: string
  }
}
