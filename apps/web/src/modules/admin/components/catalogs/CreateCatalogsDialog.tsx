import { useState } from 'react'
import { MapPinPlusIcon, PlusIcon, StickyNotePlusIcon } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { useValidatedForm } from '@/shared/hooks/useValidatedForm'
import {
  createDocumentStatusesFormSchema,
  createDocumentTypesFormSchema,
  createPhysicalLocationsFormSchema,
} from '../../schemas/catalogs.schema'
import { useCatalogs } from '../../hooks/useCatalogs'
import type { CatalogType } from '../../types/catalogs.types'

const catalogs = {
  'document-types': {
    title: 'tipo de documento',
    icon: <StickyNotePlusIcon />,
  },
  'document-statuses': {
    title: 'estatus',
    icon: <PlusIcon />,
  },
  'physical-locations': {
    title: 'ubicación física',
    icon: <MapPinPlusIcon />,
  },
}

export default function CreateCatalogsDialog({
  catalog,
}: {
  catalog: CatalogType
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          {catalogs[catalog]?.icon}
          Crear {catalogs[catalog]?.title}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear {catalogs[catalog]?.title}</DialogTitle>
          <DialogDescription>
            Complete los campos para crear un nuevo {catalogs[catalog]?.title}.
          </DialogDescription>
        </DialogHeader>

        {catalog === 'document-types' && (
          <CreateDocumentTypes setOpen={setOpen} />
        )}
        {catalog === 'document-statuses' && (
          <CreateDocumentStatuses setOpen={setOpen} />
        )}
        {catalog === 'physical-locations' && (
          <CreatePhysicalLocations setOpen={setOpen} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CreateDocumentTypes({
  setOpen,
}: {
  setOpen: (open: boolean) => void
}) {
  const { createCatalog } = useCatalogs('document-types')
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createDocumentTypesFormSchema,
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
    onSubmit: (data) => {
      createCatalog.mutate(
        { ...data, isActive: true },
        {
          onSuccess: () => {
            reset({
              code: '',
              name: '',
              description: '',
            })
            setOpen(false)
          },
        },
      )
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-3.5">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="code">Código</FieldLabel>
          <Input
            {...register('code')}
            id="code"
            type="text"
            autoFocus
            aria-invalid={!!errors.code}
          />
          <FieldError className="text-destructive-active">
            {errors.code?.message}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            {...register('name')}
            id="name"
            type="text"
            aria-invalid={!!errors.name}
          />
          <FieldError className="text-destructive-active">
            {errors.name?.message}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <Textarea
            {...register('description')}
            id="description"
            className="resize-none"
            aria-invalid={!!errors.description}
          />
          <FieldError className="text-destructive-active">
            {errors.description?.message}
          </FieldError>
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar tipo de documento</Button>
      </DialogFooter>
    </form>
  )
}

function CreateDocumentStatuses({
  setOpen,
}: {
  setOpen: (open: boolean) => void
}) {
  const { createCatalog } = useCatalogs('document-statuses')
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createDocumentStatusesFormSchema,
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
    onSubmit: (data) => {
      createCatalog.mutate(
        { ...data, sortOrder: 1, isTerminal: false, isActive: true },
        {
          onSuccess: () => {
            reset({
              code: '',
              name: '',
              description: '',
            })
            setOpen(false)
          },
        },
      )
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-3.5">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="code">Código</FieldLabel>
          <Input
            {...register('code')}
            id="code"
            type="text"
            autoFocus
            aria-invalid={!!errors.code}
          />
          <FieldError className="text-destructive-active">
            {errors.code?.message}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            {...register('name')}
            id="name"
            type="text"
            aria-invalid={!!errors.name}
          />
          <FieldError className="text-destructive-active">
            {errors.name?.message}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="description">Descripción</FieldLabel>
          <Textarea
            {...register('description')}
            id="description"
            className="resize-none"
            aria-invalid={!!errors.description}
          />
          <FieldError className="text-destructive-active">
            {errors.description?.message}
          </FieldError>
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar estado de documento</Button>
      </DialogFooter>
    </form>
  )
}

function CreatePhysicalLocations({
  setOpen,
}: {
  setOpen: (open: boolean) => void
}) {
  const { createCatalog } = useCatalogs('physical-locations')
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createPhysicalLocationsFormSchema,
    defaultValues: {
      name: '',
      drawer: '',
      reference: '',
    },
    onSubmit: (data) => {
      createCatalog.mutate(
        { ...data, isActive: true },
        {
          onSuccess: () => {
            reset({
              name: '',
              drawer: '',
              reference: '',
            })
            setOpen(false)
          },
        },
      )
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-3.5">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            {...register('name')}
            id="name"
            type="text"
            aria-invalid={!!errors.name}
          />
          <FieldError className="text-destructive-active">
            {errors.name?.message}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="drawer">Gaveta</FieldLabel>
          <Input
            {...register('drawer')}
            id="drawer"
            type="text"
            autoFocus
            aria-invalid={!!errors.drawer}
          />
          <FieldError className="text-destructive-active">
            {errors.drawer?.message}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="reference">Referencia</FieldLabel>
          <Input
            {...register('reference')}
            id="reference"
            type="text"
            autoFocus
            aria-invalid={!!errors.reference}
          />
          <FieldError className="text-destructive-active">
            {errors.reference?.message}
          </FieldError>
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar ubicación física</Button>
      </DialogFooter>
    </form>
  )
}
