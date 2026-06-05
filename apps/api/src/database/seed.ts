import 'dotenv/config'
import argon2 from 'argon2'
import { v7 as uuidv7 } from 'uuid'

import { db } from './db.js'
import {
  documentEvents,
  documentStatuses,
  documentTypes,
  documents,
  permissions,
  physicalLocations,
  rolePermissions,
  roles,
  users,
  userSessions,
} from './schema.js'

async function main() {
  console.log('Limpiando base de datos...')

  await db.delete(documentEvents)
  await db.delete(documents)
  await db.delete(userSessions)
  await db.delete(rolePermissions)
  await db.delete(users)
  await db.delete(permissions)
  await db.delete(roles)
  await db.delete(documentStatuses)
  await db.delete(documentTypes)
  await db.delete(physicalLocations)

  console.log('Insertando roles...')

  const adminRoleId = uuidv7()
  const managerRoleId = uuidv7()
  const userRoleId = uuidv7()

  await db.insert(roles).values([
    {
      id: adminRoleId,
      code: 'ADMIN',
      name: 'Administrador',
      description: 'Gestiona usuarios, roles, catálogos y configuración.',
    },
    {
      id: managerRoleId,
      code: 'JEFE',
      name: 'Jefe / Encargado',
      description: 'Gestiona documentos, expedientes y seguimiento.',
    },
    {
      id: userRoleId,
      code: 'USUARIO',
      name: 'Usuario normal',
      description: 'Registra y consulta documentos.',
    },
  ])

  console.log('Insertando permisos...')

  const permissionsData = [
    { id: uuidv7(), code: 'users:create', name: 'Crear usuarios' },
    { id: uuidv7(), code: 'users:read', name: 'Consultar usuarios' },
    { id: uuidv7(), code: 'documents:create', name: 'Crear documentos' },
    { id: uuidv7(), code: 'documents:read', name: 'Consultar documentos' },
    { id: uuidv7(), code: 'documents:update', name: 'Actualizar documentos' },
    { id: uuidv7(), code: 'documents:delete', name: 'Eliminar documentos' },
    {
      id: uuidv7(),
      code: 'documents:events:create',
      name: 'Crear eventos de documentos',
    },
    { id: uuidv7(), code: 'reports:export', name: 'Exportar reportes' },
  ]

  await db.insert(permissions).values(permissionsData)

  await db.insert(rolePermissions).values(
    permissionsData.map((permission) => ({
      roleId: adminRoleId,
      permissionId: permission.id,
    })),
  )

  await db.insert(rolePermissions).values(
    permissionsData
      .filter(
        (permission) =>
          permission.code.startsWith('documents') ||
          permission.code === 'reports:export',
      )
      .map((permission) => ({
        roleId: managerRoleId,
        permissionId: permission.id,
      })),
  )

  await db.insert(rolePermissions).values(
    permissionsData
      .filter((permission) =>
        ['documents:create', 'documents:read'].includes(permission.code),
      )
      .map((permission) => ({
        roleId: userRoleId,
        permissionId: permission.id,
      })),
  )

  console.log('Insertando catálogos...')

  const oficioTypeId = uuidv7()
  const demandaTypeId = uuidv7()
  const acuerdoTypeId = uuidv7()

  await db.insert(documentTypes).values([
    {
      id: oficioTypeId,
      code: 'OFICIO',
      name: 'Oficio',
      description: 'Documento oficial recibido o emitido.',
    },
    {
      id: demandaTypeId,
      code: 'DEMANDA',
      name: 'Demanda',
      description: 'Documento relacionado con procedimiento jurídico.',
    },
    {
      id: acuerdoTypeId,
      code: 'ACUERDO',
      name: 'Acuerdo',
      description: 'Acuerdo, resolución o comunicación interna.',
    },
  ])

  const recibidoStatusId = uuidv7()
  const seguimientoStatusId = uuidv7()
  const concluidoStatusId = uuidv7()

  await db.insert(documentStatuses).values([
    {
      id: recibidoStatusId,
      code: 'RECIBIDO',
      name: 'Recibido',
      description: 'Documento registrado inicialmente.',
      sortOrder: 1,
    },
    {
      id: seguimientoStatusId,
      code: 'EN_SEGUIMIENTO',
      name: 'En seguimiento',
      description: 'Documento en atención o trámite.',
      sortOrder: 2,
    },
    {
      id: concluidoStatusId,
      code: 'CONCLUIDO',
      name: 'Concluido',
      description: 'Documento atendido o cerrado.',
      sortOrder: 3,
      isTerminal: true,
    },
  ])

  const locationOneId = uuidv7()
  const locationTwoId = uuidv7()

  await db.insert(physicalLocations).values([
    {
      id: locationOneId,
      name: 'Archivo jurídico 2026',
      drawer: 'Gaveta 1',
      reference: 'Oficios recibidos / Enero-Junio',
    },
    {
      id: locationTwoId,
      name: 'Archivo de seguimiento',
      drawer: 'Gaveta 2',
      reference: 'Documentos en trámite',
    },
  ])

  console.log('Insertando usuarios...')

  const adminUserId = uuidv7()
  const managerUserId = uuidv7()
  const normalUserId = uuidv7()

  const passwordHash = await argon2.hash('Admin123*')

  await db.insert(users).values([
    {
      id: adminUserId,
      username: 'admin',
      passwordHash,
      fullName: 'Usuario Administrador',
      roleId: adminRoleId,
      mustChangePassword: true,
    },
    {
      id: managerUserId,
      username: 'jefa.juridico',
      passwordHash,
      fullName: 'Jefa del Área Jurídica',
      roleId: managerRoleId,
      createdByUserId: adminUserId,
      mustChangePassword: true,
    },
    {
      id: normalUserId,
      username: 'usuario.demo',
      passwordHash,
      fullName: 'Usuario Demo',
      roleId: userRoleId,
      createdByUserId: adminUserId,
      mustChangePassword: true,
    },
  ])

  console.log('Insertando documentos ficticios...')

  const documentOneId = uuidv7()
  const documentTwoId = uuidv7()
  const documentThreeId = uuidv7()

  await db.insert(documents).values({
    id: documentOneId,
    officeNumber: 'INM-AJ-001/2026',
    caseNumber: 'EXP-001/2026',
    actor: 'Juan Pérez López',
    defendant: 'Instituto Nacional de Migración',
    documentTypeId: oficioTypeId,
    officeDate: new Date('2026-05-20'),
    receivedDate: new Date('2026-05-21'),
    annexes: 'Copia simple de identificación y oficio original.',
    physicalLocationId: locationOneId,
    currentStatusId: recibidoStatusId,
    observations: 'Documento recibido para revisión inicial.',
    createdBy: managerUserId,
    updatedBy: managerUserId,
  })

  await db.insert(documents).values({
    id: documentTwoId,
    officeNumber: 'INM-AJ-002/2026',
    caseNumber: 'EXP-002/2026',
    actor: 'María Hernández Torres',
    defendant: 'Delegación administrativa',
    documentTypeId: demandaTypeId,
    officeDate: new Date('2026-05-22'),
    receivedDate: new Date('2026-05-23'),
    annexes: 'Tres anexos impresos.',
    physicalLocationId: locationTwoId,
    currentStatusId: seguimientoStatusId,
    observations: 'Documento turnado para seguimiento.',
    createdBy: managerUserId,
    updatedBy: managerUserId,
  })

  await db.insert(documents).values({
    id: documentThreeId,
    officeNumber: 'INM-AJ-003/2026',
    caseNumber: 'EXP-003/2026',
    actor: 'Carlos Ramírez Soto',
    defendant: 'Área jurídica regional',
    documentTypeId: acuerdoTypeId,
    officeDate: new Date('2026-05-24'),
    receivedDate: new Date('2026-05-25'),
    annexes: 'Sin anexos.',
    physicalLocationId: locationOneId,
    currentStatusId: concluidoStatusId,
    observations: 'Documento cerrado como prueba.',
    createdBy: normalUserId,
    updatedBy: managerUserId,
  })

  await db.insert(documentEvents).values([
    {
      documentId: documentOneId,
      eventType: 'CREATED',
      toStatusId: recibidoStatusId,
      note: 'Documento registrado en el sistema.',
      metadata: {},
      createdBy: managerUserId,
    },
    {
      documentId: documentTwoId,
      eventType: 'CREATED',
      toStatusId: recibidoStatusId,
      note: 'Documento registrado en el sistema.',
      metadata: {},
      createdBy: managerUserId,
    },
    {
      documentId: documentTwoId,
      eventType: 'STATUS_CHANGED',
      fromStatusId: recibidoStatusId,
      toStatusId: seguimientoStatusId,
      note: 'Documento marcado en seguimiento.',
      metadata: {},
      createdBy: managerUserId,
    },
    {
      documentId: documentThreeId,
      eventType: 'CREATED',
      toStatusId: recibidoStatusId,
      note: 'Documento registrado en el sistema.',
      metadata: {},
      createdBy: normalUserId,
    },
    {
      documentId: documentThreeId,
      eventType: 'STATUS_CHANGED',
      fromStatusId: recibidoStatusId,
      toStatusId: concluidoStatusId,
      note: 'Documento concluido para prueba.',
      metadata: {},
      createdBy: managerUserId,
    },
  ])

  console.log('Seed completado correctamente.')
  console.log('Usuario inicial:')
  console.log('username: admin')
  console.log('password: Admin123*')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error ejecutando seed:')
    console.error(error)
    process.exit(1)
  })
