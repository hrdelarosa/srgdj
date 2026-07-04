type MysqlErrorLike = {
  code?: unknown
  errno?: unknown
  sqlMessage?: unknown
  message?: unknown
  cause?: unknown
}

function isObject(error: unknown): error is Record<string, unknown> {
  return typeof error === 'object' && error !== null
}

function isMysqlErrorLike(error: unknown): error is MysqlErrorLike {
  return isObject(error)
}

function getMysqlErrorChain(error: unknown): MysqlErrorLike[] {
  const errors: MysqlErrorLike[] = []
  let current = error

  while (isMysqlErrorLike(current)) {
    errors.push(current)
    current = current.cause
  }

  return errors
}

export function isMysqlDuplicateEntryError(error: unknown) {
  return getMysqlErrorChain(error).some(
    (current) => current.code === 'ER_DUP_ENTRY' || current.errno === 1062,
  )
}

export function isMysqlForeignKeyError(error: unknown) {
  return getMysqlErrorChain(error).some(
    (current) =>
      current.code === 'ER_NO_REFERENCED_ROW' ||
      current.code === 'ER_NO_REFERENCED_ROW_2' ||
      current.errno === 1216 ||
      current.errno === 1452,
  )
}
