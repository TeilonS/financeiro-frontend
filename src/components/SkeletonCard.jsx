function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} bg-zinc-700 rounded animate-pulse`} />
}

export function SkeletonStatCard() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <SkeletonLine w="w-24" h="h-3" />
        <div className="w-9 h-9 rounded-xl bg-zinc-700 animate-pulse" />
      </div>
      <SkeletonLine w="w-32" h="h-7" />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine w={i === 0 ? 'w-20' : i === 1 ? 'w-32' : 'w-16'} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-zinc-700 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine w="w-40" h="h-3" />
            <SkeletonLine w="w-24" h="h-2.5" />
          </div>
          <SkeletonLine w="w-20" h="h-4" />
        </div>
      ))}
    </div>
  )
}
