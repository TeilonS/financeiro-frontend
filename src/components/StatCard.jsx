const borderColors = {
  primary: 'border-primary-500/30',
  emerald: 'border-emerald-500/30',
  red:     'border-red-500/30',
  amber:   'border-amber-400/30',
  violet:  'border-violet-500/30',
  sky:     'border-sky-500/30',
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
    <div className={`relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border ${border} p-6 overflow-hidden group transition-all hover:border-primary-500/50`}>
      {/* Label + icon */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xs font-bold text-zinc-500 uppercase tracking-[0.2em]">{label}</p>
        <div className={`p-2 rounded-lg bg-zinc-800/50 ${iconCls}`}>
          {Icon && <Icon size={16} />}
        </div>
      </div>

      {/* Valor — protagonista */}
      <p className="font-sans text-3xl font-bold text-white tracking-tight tabular-nums">{value}</p>

      {/* Contexto */}
      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-4">
          {trend !== undefined && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  )
}
