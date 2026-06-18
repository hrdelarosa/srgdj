import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'

import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof DayPicker>['mode'] extends never
    ? never
    : 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:2rem]',
        className,
      )}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('flex gap-4 flex-col md:flex-row', defaultClassNames.months),
        month: cn('flex flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: 'icon-sm' }),
          'size-[--cell-size] select-none p-0',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: 'icon-sm' }),
          'size-[--cell-size] select-none p-0',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-[--cell-size] w-full items-center justify-center gap-1 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative rounded-md border border-input shadow-xs',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none text-sm font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 select-none rounded-md text-[0.8rem] font-normal text-muted-foreground',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-[--cell-size] select-none',
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          'select-none text-[0.8rem] text-muted-foreground',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative flex aspect-square size-[--cell-size] w-full select-none items-center justify-center p-0 text-center text-sm',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-md bg-accent', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: cn(
          'rounded-md bg-accent text-accent-foreground',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon className={cn('size-4', className)} {...props} />
            )
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
