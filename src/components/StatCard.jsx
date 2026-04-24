const borderColors = {
  primary: 'border-primary-500/30',
  emerald: 'border-emerald-500/30',
  red:     'border-red-500/30',
  amber:   'border-amber-400/30',
  violet:  'border-violet-500/30',
  sky:     'border-sky-500/30',
}

const iconColors = {
  primary: 'text-primary-600 dark:text-primary-600 dark:text-primary-400',
  emerald: 'text-emerald-600 dark:text-emerald-600 dark:text-emerald-400',
  red:     'text-red-600 dark:text-red-600 dark:text-red-400',
  amber:   'text-amber-600 dark:text-amber-400',
  violet:  'text-violet-600 dark:text-violet-400',
  sky:     'text-sky-600 dark:text-sky-400',
}

export default function StatCard({ label, value, icon: Icon, color = 'primary', subtitle, trend }) {
  const border = borderColors[color] ?? borderColors.primary
  const iconCls = iconColors[color] ?? iconColors.primary

  return (
    <div className={`relative bg-white dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-zinc-100 dark:${border} p-8 overflow-hidden group transition-all hover:shadow-xl hover:shadow-primary-500/5 dark:hover:border-primary-500/50 shadow-sm shadow-zinc-200/50 dark:shadow-none`}>
      {/* Label + icon */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{label}</p>
        <div className={`p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 ${iconCls} transition-colors group-hover:bg-white dark:group-hover:bg-zinc-800`}>
          {Icon && <Icon size={18} />}
        </div>
      </div>

      {/* Valor — protagonista */}
      <p className="font-sans text-3xl font-bold text-zinc-900 dark:text-white tracking-tight tabular-nums">{value}</p>

      {/* Contexto */}
      {(subtitle || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-6">
          {trend !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400' : 'bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  )
}
