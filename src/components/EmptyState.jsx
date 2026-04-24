export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={24} className="text-zinc-500" />
        </div>
      )}
      <p className="text-zinc-700 dark:text-zinc-300 font-medium text-sm">{title}</p>
      {description && (
        <p className="text-zinc-500 text-xs mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
