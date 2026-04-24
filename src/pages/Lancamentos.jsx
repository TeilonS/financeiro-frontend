import { useState, useEffect } from 'react'
import { Plus, Download, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Search, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import * as lancApi from '../api/lancamentos'
import * as catApi from '../api/categorias'
import { fmt, formatDate, MESES } from '../utils/formatters'
import { useMonthNavigation } from '../hooks/useMonthNavigation'

const EMPTY_FORM = { descricao: '', valor: '', data: '', tipo: 'DESPESA', categoriaId: '' }

const inputCls = 'w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'

export default function Lancamentos() {
  const { mes, ano, prevMes, nextMes } = useMonthNavigation()
  const [tipoFiltro, setTipoFiltro] = useState('TODOS')
  const [lancamentos, setLancamentos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [busca, setBusca] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const params = { mes, ano, ...(tipoFiltro !== 'TODOS' ? { tipo: tipoFiltro } : {}) }
      const [resLanc, resCats] = await Promise.all([lancApi.listar(params), catApi.listar()])
      const arr = Array.isArray(resLanc.data) ? resLanc.data : resLanc.data?.content || []
      setLancamentos(arr)
      setCategorias(resCats.data || [])
    } catch {
      toast.error('Erro ao carregar lançamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [mes, ano, tipoFiltro])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  function openNew() { setEditando(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true) }
  function openEdit(l) {
    setEditando(l)
    setForm({ descricao: l.descricao || '', valor: String(l.valor || ''), data: l.data || '', tipo: l.tipo || 'DESPESA', categoriaId: String(l.categoriaId || l.categoria?.id || '') })
    setFormError(''); setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      const payload = { descricao: form.descricao, valor: parseFloat(form.valor), data: form.data, tipo: form.tipo, categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null }
      if (editando) await lancApi.atualizar(editando.id, payload)
      else await lancApi.criar(payload)
      setModalOpen(false)
      toast.success(editando ? 'Lançamento atualizado!' : 'Lançamento criado!')
      loadData()
    } catch (err) {
      setFormError(err.response?.data?.mensagem || 'Erro ao salvar lançamento.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await lancApi.deletar(confirmId)
      setConfirmId(null)
      toast.success('Lançamento excluído.')
      loadData()
    } catch {
      toast.error('Erro ao excluir lançamento.')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleExport() {
    setExportLoading(true)
    try {
      const params = { mes, ano, ...(tipoFiltro !== 'TODOS' ? { tipo: tipoFiltro } : {}) }
      const res = await lancApi.exportarCsv(params)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url; a.download = `lancamentos-${ano}-${String(mes).padStart(2, '0')}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao exportar CSV.')
    } finally {
      setExportLoading(false)
    }
  }

  const catsFiltradas = categorias.filter(c => c.tipo === form.tipo)
  const mesLabel = `${MESES[mes - 1]} ${ano}`
  const lancamentosFiltrados = busca.trim()
    ? lancamentos.filter(l => l.descricao?.toLowerCase().includes(busca.toLowerCase()) || l.categoriaNome?.toLowerCase().includes(busca.toLowerCase()))
    : lancamentos

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-zinc-900 dark:text-white">Lançamentos</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Receitas e despesas do período</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exportLoading}
            className="border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
            {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Exportar CSV
          </button>
          <button onClick={openNew}
            className="bg-primary-600 hover:bg-primary-700 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <Plus size={16} /> Novo lançamento
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2 py-1.5 shadow-sm">
          <button onClick={prevMes} className="p-1 hover:bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <ChevronLeft size={16} className="text-zinc-500" />
          </button>
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-w-[120px] text-center">{mesLabel}</span>
          <button onClick={nextMes} className="p-1 hover:bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <ChevronRight size={16} className="text-zinc-500" />
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar descrição ou categoria..."
            className="w-full pl-8 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500" />
        </div>

        <div className="flex bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-1 gap-1 shadow-sm">
          {['TODOS', 'RECEITA', 'DESPESA'].map(t => (
            <button key={t} onClick={() => setTipoFiltro(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tipoFiltro === t ? 'bg-primary-600 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-50 dark:bg-zinc-800'}`}>
              {t === 'TODOS' ? 'Todos' : t === 'RECEITA' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        ) : lancamentosFiltrados.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhum lançamento encontrado"
            description="Adicione um novo lançamento para começar a registrar suas finanças."
            action={
              <button onClick={openNew} className="bg-primary-600 hover:bg-primary-700 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <Plus size={14} /> Novo lançamento
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-6 py-3">Data</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-6 py-3">Descrição</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-6 py-3">Categoria</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide px-6 py-3">Tipo</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wide px-6 py-3">Valor</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wide px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {lancamentosFiltrados.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-50 dark:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(l.data)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-800 dark:text-zinc-200">{l.descricao}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{l.categoriaNome || l.categoria?.nome || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${l.tipo === 'RECEITA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {l.tipo}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${l.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {l.tipo === 'RECEITA' ? '+' : '-'}{fmt(l.valor)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(l)} className="p-2 hover:bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-500 dark:hover:text-zinc-500">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setConfirmId(l.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-zinc-500 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Excluir lançamento"
        description="Esta ação não pode ser desfeita."
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar lançamento' : 'Novo lançamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Descrição</label>
            <input type="text" required value={form.descricao} onChange={set('descricao')} placeholder="Ex: Salário, Aluguel..." className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Valor (R$)</label>
              <input type="number" required min="0.01" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Data</label>
              <input type="date" required value={form.data} onChange={set('data')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Tipo</label>
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Categoria</label>
            <select value={form.categoriaId} onChange={set('categoriaId')} className={inputCls}>
              <option value="">Sem categoria</option>
              {catsFiltradas.map(c => <option key={c.id} value={c.id}>{c.categoriaPaiNome ? `${c.categoriaPaiNome} › ` : ''}{c.nome}</option>)}
            </select>
          </div>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-xl text-sm font-medium">Cancelar</button>
            <button type="submit" disabled={formLoading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-zinc-900 dark:text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {editando ? 'Salvar alterações' : 'Criar lançamento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
