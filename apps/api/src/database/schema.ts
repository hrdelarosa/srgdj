import { relations } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'

import {
  boolean,
  date,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

export const documentTypes = mysqlTable('document_types', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const documentStatuses = mysqlTable('document_statuses', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: varchar('description', { length: 255 }),
  sortOrder: int('sort_order').notNull(),
  isTerminal: boolean('is_terminal').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const physicalLocations = mysqlTable('physical_locations', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: varchar('name', { length: 150 }).notNull(),
  drawer: varchar('drawer', { length: 100 }),
  reference: varchar('reference', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const roles = mysqlTable('roles', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const permissions = mysqlTable('permissions', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rolePermissions = mysqlTable(
  'role_permissions',
  {
    roleId: varchar('role_id', { length: 36 })
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),

    permissionId: varchar('permission_id', { length: 36 })
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
)

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    username: varchar('username', { length: 80 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 150 }).notNull(),

    roleId: varchar('role_id', { length: 36 })
      .notNull()
      .references(() => roles.id),

    isActive: boolean('is_active').notNull().default(true),
    mustChangePassword: boolean('must_change_password').notNull().default(true),

    lastLoginAt: timestamp('last_login_at'),

    createdByUserId: varchar('created_by_user_id', { length: 36 }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    roleIdx: index('users_role_id_idx').on(table.roleId),
  }),
)

export const userSessions = mysqlTable(
  'user_sessions',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    tokenHash: varchar('token_hash', { length: 255 }).notNull(),

    expiresAt: timestamp('expires_at').notNull(),
    lastActivityAt: timestamp('last_activity_at').notNull(),
    revokedAt: timestamp('revoked_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdByIp: varchar('created_by_ip', { length: 100 }),
    userAgent: varchar('user_agent', { length: 500 }),
  },
  (table) => ({
    userIdx: index('user_sessions_user_id_idx').on(table.userId),
    tokenHashIdx: uniqueIndex('user_sessions_token_hash_idx').on(
      table.tokenHash,
    ),
  }),
)

export const documents = mysqlTable(
  'documents',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    officeNumber: varchar('office_number', { length: 100 }).notNull(),
    caseNumber: varchar('case_number', { length: 100 }),

    actor: varchar('actor', { length: 255 }),
    defendant: varchar('defendant', { length: 255 }),

    documentTypeId: varchar('document_type_id', { length: 36 })
      .notNull()
      .references(() => documentTypes.id),

    officeDate: date('office_date'),
    receivedDate: date('received_date').notNull(),

    annexes: text('annexes'),

    physicalLocationId: varchar('physical_location_id', {
      length: 36,
    }).references(() => physicalLocations.id),

    currentStatusId: varchar('current_status_id', { length: 36 })
      .notNull()
      .references(() => documentStatuses.id),

    observations: text('observations'),

    createdBy: varchar('created_by', { length: 36 })
      .notNull()
      .references(() => users.id),

    updatedBy: varchar('updated_by', { length: 36 })
      .notNull()
      .references(() => users.id),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    officeNumberIdx: index('documents_office_number_idx').on(
      table.officeNumber,
    ),
    caseNumberIdx: index('documents_case_number_idx').on(table.caseNumber),
    receivedDateIdx: index('documents_received_date_idx').on(
      table.receivedDate,
    ),
    statusIdx: index('documents_status_idx').on(table.currentStatusId),
    typeIdx: index('documents_type_idx').on(table.documentTypeId),
    locationIdx: index('documents_location_idx').on(table.physicalLocationId),

    uniqueActiveOfficeNumber: uniqueIndex(
      'documents_office_number_unique_idx',
    ).on(table.officeNumber),
  }),
)

export const documentEvents = mysqlTable(
  'document_events',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    documentId: varchar('document_id', { length: 36 })
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),

    eventType: varchar('event_type', { length: 80 }).notNull(),

    fromStatusId: varchar('from_status_id', { length: 36 }).references(
      () => documentStatuses.id,
    ),

    toStatusId: varchar('to_status_id', { length: 36 }).references(
      () => documentStatuses.id,
    ),

    note: text('note'),
    metadata: json('metadata').notNull().default({}),

    createdBy: varchar('created_by', { length: 36 })
      .notNull()
      .references(() => users.id),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    documentIdx: index('document_events_document_idx').on(
      table.documentId,
      table.createdAt,
    ),
    eventTypeIdx: index('document_events_type_idx').on(table.eventType),
  }),
)

export const documentTypesRelations = relations(documentTypes, ({ many }) => ({
  documents: many(documents),
}))

export const documentStatusesRelations = relations(
  documentStatuses,
  ({ many }) => ({
    documents: many(documents),
    eventsFromStatus: many(documentEvents, {
      relationName: 'events_from_status',
    }),
    eventsToStatus: many(documentEvents, {
      relationName: 'events_to_status',
    }),
  }),
)

export const physicalLocationsRelations = relations(
  physicalLocations,
  ({ many }) => ({
    documents: many(documents),
  }),
)

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
)

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  createdByUser: one(users, {
    fields: [users.createdByUserId],
    references: [users.id],
  }),
  sessions: many(userSessions),
  createdDocuments: many(documents, {
    relationName: 'documents_created_by',
  }),
  updatedDocuments: many(documents, {
    relationName: 'documents_updated_by',
  }),
  documentEvents: many(documentEvents),
}))

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  documentType: one(documentTypes, {
    fields: [documents.documentTypeId],
    references: [documentTypes.id],
  }),
  currentStatus: one(documentStatuses, {
    fields: [documents.currentStatusId],
    references: [documentStatuses.id],
  }),
  physicalLocation: one(physicalLocations, {
    fields: [documents.physicalLocationId],
    references: [physicalLocations.id],
  }),
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
    relationName: 'documents_created_by',
  }),
  updater: one(users, {
    fields: [documents.updatedBy],
    references: [users.id],
    relationName: 'documents_updated_by',
  }),
  events: many(documentEvents),
}))

export const documentEventsRelations = relations(documentEvents, ({ one }) => ({
  document: one(documents, {
    fields: [documentEvents.documentId],
    references: [documents.id],
  }),
  fromStatus: one(documentStatuses, {
    fields: [documentEvents.fromStatusId],
    references: [documentStatuses.id],
    relationName: 'events_from_status',
  }),
  toStatus: one(documentStatuses, {
    fields: [documentEvents.toStatusId],
    references: [documentStatuses.id],
    relationName: 'events_to_status',
  }),
  creator: one(users, {
    fields: [documentEvents.createdBy],
    references: [users.id],
  }),
}))
