import { useState, useRef } from 'react'
import { HardDrive, Download, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import * as backupApi from '../api/backup'

export default function Backup() {
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef()

  async function handleExportar() {
    setExportLoading(true); setError(''); setSuccess('')
    try {
      const res = await backupApi.exportar()
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-financeiro-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Backup exportado com sucesso.')
    } catch { setError('Erro ao exportar backup.') }
    finally { setExportLoading(false) }
  }

  async function handleImportar(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportLoading(true); setError(''); setSuccess('')
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const res = await backupApi.importar(data)
      const counts = res.data || {}
      const total = Object.values(counts).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0)
      setSuccess(`Backup importado com sucesso. ${total} registros restaurados.`)
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao importar backup. Verifique se o arquivo é válido.')
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Backup</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Exporte ou restaure todos os seus dados</p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <CheckCircle size={16} />{success}
          <button onClick={() => setSuccess('')} className="ml-auto text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      <div className="space-y-4">
        {/* Exportar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Download size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Exportar dados</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Baixa um arquivo JSON com todos os seus dados: categorias, lançamentos, metas, orçamentos, cartões e recorrências.
              </p>
              <button onClick={handleExportar} disabled={exportLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2">
                {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Exportar backup
              </button>
            </div>
          </div>
        </div>

        {/* Importar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Upload size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Importar dados</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Restaura dados a partir de um arquivo de backup JSON exportado anteriormente.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-4">
                ⚠ Atenção: a importação adiciona os dados ao seu cadastro atual sem apagar o existente.
              </p>
              <button onClick={() => fileInputRef.current?.click()} disabled={importLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2">
                {importLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Selecionar arquivo
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportar} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={16} className="text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">O que é incluído no backup</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            {['Categorias e subcategorias', 'Todos os lançamentos', 'Metas de gastos', 'Orçamentos mensais', 'Cartões de crédito', 'Recorrências'].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
