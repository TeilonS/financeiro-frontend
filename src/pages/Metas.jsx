import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Target, AlertTriangle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import * as metasApi from '../api/metas'
import * as catApi from '../api/categorias'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const EMPTY_FORM = { categoriaId: '', valorLimite: '', mes: '', ano: '' }

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500'

export default function Metas() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [metas, setMetas] = useState([])
  const [alertasList, setAlertasList] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletandoId, setDeletandoId] = useState(null)

  function prevMes() {
    if (mes === 1) { setMes(12); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }
  function nextMes() {
    if (mes === 12) { setMes(1); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const params = { mes, ano }
      const [resMetas, resAlertas, resCats] = await Promise.all([
        metasApi.listar(),
        metasApi.alertas(params),
        catApi.listar(),
      ])
      setMetas(resMetas.data || [])
      setAlertasList(resAlertas.data || [])
      setCategorias(resCats.data || [])
    } catch {
      setError('Erro ao carregar metas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [mes, ano])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  function openNew() {
    setForm({ ...EMPTY_FORM, mes: String(mes), ano: String(ano) })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      await metasApi.criar({
        categoriaId: parseInt(form.categoriaId),
        valorLimite: parseFloat(form.valorLimite),
        mes: parseInt(form.mes),
        ano: parseInt(form.ano),
      })
      setModalOpen(false)
      loadData()
    } catch (err) {
      setFormError(err.response?.data?.mensagem || 'Erro ao criar meta.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await metasApi.deletar(id)
      setDeletandoId(null)
      loadData()
    } catch {
      setError('Erro ao excluir meta.')
    }
  }

  const catsDespesa = categorias.filter(c => c.tipo === 'DESPESA')
  const mesLabel = `${MESES[mes - 1]} ${ano}`
  const metasFiltradas = metas.filter(m => m.mes === mes && m.ano === ano)

  function progressColor(pct) {
    if (pct > 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-amber-400'
    return 'bg-emerald-500'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Metas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Controle de orçamento por categoria</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1.5 shadow-sm">
            <button onClick={prevMes} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-center">{mesLabel}</span>
            <button onClick={nextMes} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <button
            onClick={openNew}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nova meta
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {alertasList.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Atenção: categorias acima do limite</span>
          </div>
          <ul className="space-y-1">
            {alertasList.map((a, i) => (
              <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                <span><strong>{a.categoriaNome || a.categoria}</strong>: {fmt(a.valorGasto)} de {fmt(a.valorLimite)} ({a.percentual?.toFixed(0) || '—'}%)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      ) : metasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
          <Target size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma meta para este mês</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Crie metas para controlar seus gastos por categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {metasFiltradas.map(m => {
            const pct = m.valorLimite > 0 ? ((m.valorGasto || 0) / m.valorLimite) * 100 : 0
            return (
              <div key={m.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.categoriaNome || m.categoria?.nome || '—'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Limite: {fmt(m.valorLimite)}</p>
                  </div>
                  {deletandoId === m.id ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleDelete(m.id)}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors">Sim</button>
                      <button onClick={() => setDeletandoId(null)}
                        className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2 py-1 rounded-lg transition-colors">Não</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletandoId(m.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Gasto: {fmt(m.valorGasto || 0)}</span>
                    <span className={`text-xs font-semibold ${pct > 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progressColor(pct)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {pct > 100 && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Limite excedido em {fmt((m.valorGasto || 0) - m.valorLimite)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova meta de orçamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria (Despesa)</label>
            <select required value={form.categoriaId} onChange={set('categoriaId')} className={inputCls}>
              <option value="">Selecione uma categoria</option>
              {catsDespesa.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor limite (R$)</label>
            <input
              type="number" required min="0.01" step="0.01" value={form.valorLimite} onChange={set('valorLimite')}
              placeholder="0,00" className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mês</label>
              <select required value={form.mes} onChange={set('mes')} className={inputCls}>
                <option value="">Mês</option>
                {MESES.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ano</label>
              <input
                type="number" required min="2020" max="2099" value={form.ano} onChange={set('ano')}
                placeholder="2026" className={inputCls}
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={formLoading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              Criar meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
