const borderColors = {
  primary: 'border-primary-500',
  emerald: 'border-emerald-500',
  red:     'border-red-500',
  amber:   'border-amber-400',
  violet:  'border-violet-500',
  sky:     'border-sky-500',
}

const iconColors = {
  primary: 'text-primary-400',
  emerald: 'text-emerald-400',
  red:     'text-red-400',
  amber:   'text-amber-400',
  violet:  'text-violet-400',
  sky:     'text-sky-400',
}

export default function StatCard({ label, value, icon: Icon, color = 'primary', subtitle, trend }) {
  const border = borderColors[color] ?? borderColors.primary
  const iconCls = iconColors[color] ?? iconColors.primary

  return (
    <div className={`relative bg-zinc-900 rounded-xl border border-zinc-800 border-l-[3px] ${border} p-5 overflow-hidden group`}>
      {/* Label + icon */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-2xs font-medium text-zinc-500 uppercase tracking-widest">{label}</p>
        {Icon && <Icon size={14} className={`${iconCls} opacity-70`} />}
      </div>

      {/* Valor — protagonista */}
      <p className="font-mono text-xl font-500 text-white tracking-tight tabular-nums">{value}</p>

      {/* Contexto */}
      {subtitle && (
        <p className="text-xs text-zinc-600 mt-1.5">{subtitle}</p>
      )}
      {trend !== undefined && (
        <p className={`text-xs mt-1.5 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </p>
      )}
    </div>
  )
}
