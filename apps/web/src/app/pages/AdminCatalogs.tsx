import { useState } from 'react'

import DocumentsTypes from '@/modules/admin/components/catalogs/DocumentsTypes'
import DocumentsStatuses from '@/modules/admin/components/catalogs/DocumentStatuses'
import PhysicalLocations from '@/modules/admin/components/catalogs/PhysicalLocations'
import CreateCatalogsDialog from '@/modules/admin/components/catalogs/CreateCatalogsDialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import type { CatalogType } from '@/modules/admin/types/catalogs.types'

export function AdminCatalogsPage() {
  const [catalogsData, setCatalogsData] =
    useState<CatalogType>('document-types')

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogos</h2>
          <p className="text-sm text-muted-foreground">
            Tipos, estatus y ubicaciones físicas del archivo.
          </p>
        </div>

        <CreateCatalogsDialog catalog={catalogsData} />
      </div>

      <Tabs
        defaultValue="document-types"
        className="-mt-1.5"
        onValueChange={(value) => setCatalogsData(value as CatalogType)}
      >
        <TabsList variant="line" className="mb-3">
          <TabsTrigger value="document-types">Tipos de documento</TabsTrigger>

          <TabsTrigger value="document-statuses">Estatus</TabsTrigger>

          <TabsTrigger value="physical-locations">
            Ubicaciones físicas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document-types">
          <DocumentsTypes />
        </TabsContent>
        <TabsContent value="document-statuses">
          <DocumentsStatuses />
        </TabsContent>
        <TabsContent value="physical-locations">
          <PhysicalLocations />
        </TabsContent>
      </Tabs>
    </>
  )
}
