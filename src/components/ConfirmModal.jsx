import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Excluir', loading = false }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
            {description && (
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
