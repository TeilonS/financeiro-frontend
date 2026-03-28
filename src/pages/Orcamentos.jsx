import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, PiggyBank, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import * as orcApi from '../api/orcamentos'
import * as catApi from '../api/categorias'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function Orcamentos() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [orcamentos, setOrcamentos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ categoriaId: '', valorLimite: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  function prevMes() { if (mes === 1) { setMes(12); setAno(a => a-1) } else setMes(m => m-1) }
  function nextMes() { if (mes === 12) { setMes(1); setAno(a => a+1) } else setMes(m => m+1) }

  async function load() {
    setLoading(true)
    try {
      const [resOrc, resCat] = await Promise.all([orcApi.listar(mes, ano), catApi.listar()])
      setOrcamentos(resOrc.data || [])
      setCategorias(resCat.data || [])
    } catch { setError('Erro ao carregar orçamentos.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [mes, ano])

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      await orcApi.salvar({ categoriaId: parseInt(form.categoriaId), mes, ano, valorLimite: parseFloat(form.valorLimite) })
      setModalOpen(false); load()
    } catch (err) { setFormError(err.response?.data?.mensagem || 'Erro ao salvar.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id) {
    try { await orcApi.deletar(id); load() }
    catch { setError('Erro ao excluir.') }
  }

  const mesLabel = `${MESES[mes-1]} ${ano}`
  const categoriasComOrcamento = new Set(orcamentos.map(o => o.categoriaId))
  const categoriasDisponiveis = categorias.filter(c => !categoriasComOrcamento.has(c.id))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Orçamentos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Defina limites de gasto por categoria</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1.5 shadow-sm">
            <button onClick={prevMes} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-center">{mesLabel}</span>
            <button onClick={nextMes} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <button onClick={() => { setForm({ categoriaId: '', valorLimite: '' }); setFormError(''); setModalOpen(true) }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Novo orçamento
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16}/>{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={28} className="animate-spin text-indigo-500" /></div>
      ) : orcamentos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center py-16 text-slate-400 dark:text-slate-500">
          <PiggyBank size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum orçamento definido para este mês</p>
          <p className="text-sm mt-1">Crie limites por categoria para controlar seus gastos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orcamentos.map(o => (
            <div key={o.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{o.categoriaNome}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{o.categoriaTipo === 'DESPESA' ? 'Despesa' : 'Receita'}</p>
                </div>
                <button onClick={() => handleDelete(o.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Gasto: <strong className={o.percentualUsado >= 100 ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}>{fmt(o.valorGasto)}</strong></span>
                  <span>Limite: {fmt(o.valorLimite)}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${o.percentualUsado}%`, backgroundColor: o.percentualUsado >= 100 ? '#ef4444' : o.percentualUsado >= 80 ? '#f59e0b' : '#6366f1' }} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">{o.percentualUsado}% utilizado</span>
                <span className={`text-sm font-semibold ${o.percentualUsado >= 100 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {o.percentualUsado >= 100 ? `−${fmt(o.valorGasto - o.valorLimite)} acima` : `${fmt(o.valorLimite - o.valorGasto)} restante`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo orçamento" maxWidth="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
            <select required value={form.categoriaId} onChange={e => setForm(f => ({...f, categoriaId: e.target.value}))}
              className={inputCls}>
              <option value="">Selecionar...</option>
              {categoriasDisponiveis.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Limite (R$)</label>
            <input type="number" required min="0.01" step="0.01" value={form.valorLimite}
              onChange={e => setForm(f => ({...f, valorLimite: e.target.value}))} placeholder="0,00"
              className={inputCls} />
          </div>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium">Cancelar</button>
            <button type="submit" disabled={formLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {formLoading && <Loader2 size={14} className="animate-spin" />} Criar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
