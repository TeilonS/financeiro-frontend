import { useState } from 'react'
import { FileUp, FileDown, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import * as backupApi from '../api/backup'
import toast from 'react-hot-toast'

export default function Backup() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await backupApi.exportar()
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Backup exportado com sucesso!')
    } catch { toast.error('Erro ao exportar backup.') }
    finally { setLoading(false) }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('Atenção: Os dados do arquivo serão adicionados ao seu cadastro. Deseja continuar?')) return
    
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const dados = JSON.parse(event.target.result)
        await backupApi.importar(dados)
        toast.success('Dados importados com sucesso!')
      } catch { toast.error('Erro ao importar. Verifique o formato do arquivo.') }
      finally { setLoading(false); e.target.value = '' }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen transition-colors duration-300">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Backup</h1>
        <p className="text-zinc-500 text-sm mt-2">Exporte ou restaure todos os seus dados com segurança</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Exportar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 flex items-start gap-6 shadow-sm shadow-zinc-200/50 dark:shadow-none">
          <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <FileDown className="text-primary-500" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Exportar dados</h2>
            <p className="text-sm text-zinc-500 mt-1 mb-6">Baixa um arquivo JSON com todos os seus dados: categorias, lançamentos, metas, orçamentos, cartões e recorrências.</p>
            <button onClick={handleExport} disabled={loading} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Exportar backup
            </button>
          </div>
        </div>

        {/* Importar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 flex items-start gap-6 shadow-sm shadow-zinc-200/50 dark:shadow-none">
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <FileUp className="text-amber-500" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Importar dados</h2>
            <p className="text-sm text-zinc-500 mt-1 mb-2">Restaura dados a partir de um arquivo de backup JSON exportado anteriormente.</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mb-6">
              <AlertTriangle size={12} /> Atenção: a importação adiciona os dados ao seu cadastro atual sem apagar o existente.
            </p>
            <label className="inline-flex bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer">
              Selecionar arquivo
              <input type="file" className="hidden" accept=".json" onChange={handleImport} disabled={loading} />
            </label>
          </div>
        </div>

        {/* Segurança */}
        <div className="bg-zinc-100 dark:bg-zinc-800/30 rounded-3xl p-8 border border-zinc-200 dark:border-white/5">
           <div className="flex items-center gap-2 mb-4 text-zinc-900 dark:text-white">
              <ShieldCheck size={20} className="text-primary-500" />
              <h3 className="font-bold">O que é incluído no backup</h3>
           </div>
           <ul className="grid grid-cols-2 gap-y-2 gap-x-8">
              {['Categorias', 'Lançamentos', 'Metas', 'Orçamentos', 'Cartões', 'Recorrências'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-zinc-500">
                  <div className="w-1 h-1 rounded-full bg-primary-500" />
                  {item}
                </li>
              ))}
           </ul>
        </div>
      </div>
    </div>
  )
}
