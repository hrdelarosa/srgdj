interface Props {
  label: string
  value?: React.ReactNode
}

export default function Detail({ label, value }: Props) {
  const isEmpty = value === undefined || value === null || value === ''

  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`text-sm ${isEmpty ? 'italic text-muted-foreground' : 'text-foreground'}`}
      >
        {isEmpty ? 'Sin información' : value}
      </dd>
    </div>
  )
}
