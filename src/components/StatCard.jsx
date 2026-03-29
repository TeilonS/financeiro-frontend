export default function StatCard({ label, value, icon: Icon, color = 'primary', subtitle, trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    red:     'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color] ?? colors.primary}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      )}
      {trend !== undefined && (
        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs mês anterior
        </p>
      )}
    </div>
  )
}
