import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { useState } from 'react'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group'
import { Button } from '@/shared/components/ui/button'
import type { Input } from '@/shared/components/ui/input'

interface Props extends React.ComponentProps<typeof Input> {
  label?: string
  children?: React.ReactNode
  error?: string | undefined
}

export default function PasswordInput({
  label,
  children,
  error,
  ...props
}: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Field>
      {label && <FieldLabel htmlFor={props.id}>{label}</FieldLabel>}
      {children}

      <InputGroup>
        <InputGroupInput
          {...props}
          id={props.id}
          type={showPassword ? 'text' : 'password'}
        />
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </Button>
        </InputGroupAddon>
      </InputGroup>

      <FieldError>{error}</FieldError>
    </Field>
  )
}
