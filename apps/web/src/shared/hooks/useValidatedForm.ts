import { zodResolver } from '@hookform/resolvers/zod'
import {
  type FieldValues,
  type SubmitHandler,
  useForm,
  type DefaultValues,
} from 'react-hook-form'
import { z, type ZodType } from 'zod'

interface Props<Schema extends ZodType<FieldValues, FieldValues>> {
  formSchema: Schema
  defaultValues?: DefaultValues<z.infer<Schema>>
  onSubmit: SubmitHandler<z.infer<Schema>>
}

export function useValidatedForm<
  Schema extends ZodType<FieldValues, FieldValues>,
>({ formSchema, defaultValues, onSubmit }: Props<Schema>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<z.infer<Schema>, unknown, z.output<Schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues,
  })

  const handleFormSubmit: SubmitHandler<z.infer<Schema>> = async (data) => {
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
