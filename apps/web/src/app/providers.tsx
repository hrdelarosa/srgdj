import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { AuthBootstrap } from '@/modules/auth/components/AuthBootstrap'
import { TooltipProvider } from '@/shared/components/ui/tooltip'

const queryClient = new QueryClient()

export default function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
