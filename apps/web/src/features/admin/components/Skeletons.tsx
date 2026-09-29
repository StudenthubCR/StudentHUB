export function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col justify-between rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full bg-border/60" />
          <div className="h-7 w-16 rounded-lg bg-border/80" />
        </div>
        <div className="size-11 rounded-xl bg-border/50" />
      </div>
      <div className="mt-4 border-t border-border/40 pt-2.5">
        <div className="h-3 w-36 rounded-full bg-border/40" />
      </div>
    </div>
  )
}

export function SkeletonTableRow({ columnas = 6 }: { columnas?: number }) {
  return (
    <tr className="animate-pulse border-b border-border/60">
      {Array.from({ length: columnas }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 rounded-md bg-border/50"
            style={{ width: `${Math.max(40, 85 - (i * 12))}%` }}
          />
        </td>
      ))}
    </tr>
  )
}
