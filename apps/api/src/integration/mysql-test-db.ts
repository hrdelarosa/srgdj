import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import mysql, { type Connection } from 'mysql2/promise'

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replaceAll('`', '``')}\``
}

function createDatabaseName() {
  const suffix = randomUUID().replaceAll('-', '').slice(0, 16)
  return `srgdj_it_${suffix}`
}

function createServerUrl(databaseUrl: string) {
  const url = new URL(databaseUrl)
  url.pathname = '/'
  return url
}

function createDatabaseUrl(databaseUrl: string, databaseName: string) {
  const url = new URL(databaseUrl)
  url.pathname = `/${databaseName}`
  return url.toString()
}

async function executeMigrationFile(connection: Connection, fileName: string) {
  const migrationPath = path.resolve('drizzle', fileName)
  const migrationSql = await readFile(migrationPath, 'utf8')
  const statements = migrationSql
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await connection.query(statement)
  }
}

export async function createDisposableMysqlDatabase(databaseUrl: string) {
  const databaseName = createDatabaseName()
  const serverConnection = await mysql.createConnection(
    createServerUrl(databaseUrl).toString(),
  )

  await serverConnection.query(
    `CREATE DATABASE ${quoteIdentifier(databaseName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await serverConnection.end()

  const disposableDatabaseUrl = createDatabaseUrl(databaseUrl, databaseName)
  const databaseConnection = await mysql.createConnection(disposableDatabaseUrl)

  await executeMigrationFile(databaseConnection, '0000_sticky_ghost_rider.sql')
  await executeMigrationFile(databaseConnection, '0001_v1_finalizada.sql')

  return {
    databaseName,
    databaseUrl: disposableDatabaseUrl,
    connection: databaseConnection,
    async drop() {
      await databaseConnection.end()
      const cleanupConnection = await mysql.createConnection(
        createServerUrl(databaseUrl).toString(),
      )
      await cleanupConnection.query(
        `DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`,
      )
      await cleanupConnection.end()
    },
  }
}

export async function clearMysqlDatabase(connection: Connection) {
  const tables = [
    'audit_logs',
    'document_events',
    'documents',
    'user_sessions',
    'role_permissions',
    'users',
    'permissions',
    'roles',
    'document_statuses',
    'document_types',
    'physical_locations',
  ]

  await connection.query('SET FOREIGN_KEY_CHECKS = 0')

  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE ${quoteIdentifier(table)}`)
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 1')
}
