import { zodResolver } from '@hookform/resolvers/zod'
import {
  type FieldValues,
  type SubmitHandler,
  useForm,
  type DefaultValues,
} from 'react-hook-form'
import { z, type ZodType } from 'zod'

interface Props<Schema extends ZodType> {
  formSchema: Schema
  defaultValues?: DefaultValues<z.input<Schema>>
  onSubmit: SubmitHandler<z.output<Schema>>
}

export function useValidatedForm<Schema extends ZodType>({
  formSchema,
  defaultValues,
  onSubmit,
}: Props<Schema>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<z.input<Schema> & FieldValues, unknown, z.output<Schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: defaultValues as DefaultValues<z.input<Schema> & FieldValues>,
  })

  const handleFormSubmit: SubmitHandler<z.output<Schema>> = async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(handleFormSubmit),
    errors,
    reset,
    control,
    setValue,
    watch,
  }
}
