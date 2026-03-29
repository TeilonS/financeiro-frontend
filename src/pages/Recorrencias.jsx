import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, RefreshCw, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '../components/Modal'
import * as recApi from '../api/recorrencias'
import * as catApi from '../api/categorias'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const FREQUENCIAS = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'ANUAL', label: 'Anual' },
]

const EMPTY_FORM = {
  descricao: '', valor: '', tipo: 'DESPESA', frequencia: 'MENSAL',
  diaReferencia: '1', dataInicio: '', dataFim: '', categoriaId: '',
}

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500'

export default function Recorrencias() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [recorrencias, setRecorrencias] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [desativandoId, setDesativandoId] = useState(null)
  const [gerarLoading, setGerarLoading] = useState(false)
  const [gerarResult, setGerarResult] = useState(null)

  function prevMes() {
    if (mes === 1) { setMes(12); setAno(a => a - 1) } else setMes(m => m - 1)
  }
  function nextMes() {
    if (mes === 12) { setMes(1); setAno(a => a + 1) } else setMes(m => m + 1)
  }

  async function loadData() {
    setLoading(true); setError('')
    try {
      const [resRec, resCats] = await Promise.all([recApi.listar(), catApi.listar()])
      setRecorrencias(resRec.data || [])
      setCategorias(resCats.data || [])
    } catch { setError('Erro ao carregar recorrências.') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  function openNew() { setForm(EMPTY_FORM); setFormError(''); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      await recApi.criar({
        descricao: form.descricao, valor: parseFloat(form.valor), tipo: form.tipo,
        frequencia: form.frequencia, diaReferencia: parseInt(form.diaReferencia),
        dataInicio: form.dataInicio, dataFim: form.dataFim || null,
        categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
      })
      setModalOpen(false); loadData()
    } catch (err) { setFormError(err.response?.data?.mensagem || 'Erro ao criar recorrência.') }
    finally { setFormLoading(false) }
  }

  async function handleDesativar(id) {
    try { await recApi.desativar(id); setDesativandoId(null); loadData() }
    catch { setError('Erro ao desativar recorrência.') }
  }

  async function handleGerar() {
    setGerarLoading(true); setGerarResult(null)
    try {
      const res = await recApi.gerar(mes, ano)
      setGerarResult(res.data)
    } catch (err) { setError(err.response?.data?.mensagem || 'Erro ao gerar lançamentos.') }
    finally { setGerarLoading(false) }
  }

  const catsFiltradas = categorias.filter(c => c.tipo === form.tipo)
  const mesLabel = `${MESES[mes - 1]} ${ano}`

  function freqBadge(f) {
    const map = { MENSAL: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400', SEMANAL: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', ANUAL: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }
    return map[f] || 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Recorrências</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Lançamentos automáticos recorrentes</p>
        </div>
        <button onClick={openNew}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={16} /> Nova recorrência
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Gerar lançamentos</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1.5">
            <button onClick={prevMes} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-center">{mesLabel}</span>
            <button onClick={nextMes} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <button onClick={handleGerar} disabled={gerarLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2">
            {gerarLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Gerar
          </button>
          {gerarResult !== null && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-xl">
              <CheckCircle size={15} />
              {typeof gerarResult === 'object' && gerarResult.quantidade !== undefined
                ? `${gerarResult.quantidade} lançamento(s) gerado(s)`
                : typeof gerarResult === 'number'
                  ? `${gerarResult} lançamento(s) gerado(s)`
                  : 'Lançamentos gerados com sucesso'}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      ) : recorrencias.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
          <RefreshCw size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma recorrência cadastrada</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Crie recorrências para gerar lançamentos automaticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recorrencias.map(r => (
            <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.descricao}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{r.categoriaNome || r.categoria?.nome || 'Sem categoria'}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.ativa ? (
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" title="Ativa" />
                  ) : (
                    <span className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" title="Inativa" />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.tipo === 'RECEITA' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {r.tipo}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${freqBadge(r.frequencia)}`}>
                  {FREQUENCIAS.find(f => f.value === r.frequencia)?.label || r.frequencia}
                </span>
                {!r.ativa && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    Inativa
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-semibold ${r.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {fmt(r.valor)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {r.frequencia === 'MENSAL' ? `Dia ${r.diaReferencia} de cada mês` :
                     r.frequencia === 'SEMANAL' ? `Toda semana (dia ${r.diaReferencia})` :
                     `Dia ${r.diaReferencia} do ano`}
                  </p>
                </div>

                {r.ativa && (
                  <>
                    {desativandoId === r.id ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDesativar(r.id)}
                          className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors">Sim</button>
                        <button onClick={() => setDesativandoId(null)}
                          className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2 py-1 rounded-lg transition-colors">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setDesativandoId(r.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                        title="Desativar recorrência">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {(r.dataInicio || r.dataFim) && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex gap-3">
                  {r.dataInicio && <span>Início: {new Date(r.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                  {r.dataFim && <span>Fim: {new Date(r.dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova recorrência" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
            <input type="text" required value={form.descricao} onChange={set('descricao')} placeholder="Ex: Aluguel, Academia..." className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor (R$)</label>
              <input type="number" required min="0.01" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
              <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
                <option value="DESPESA">Despesa</option>
                <option value="RECEITA">Receita</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Frequência</label>
              <select value={form.frequencia} onChange={set('frequencia')} className={inputCls}>
                {FREQUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dia referência (1–28)</label>
              <input type="number" required min="1" max="28" value={form.diaReferencia} onChange={set('diaReferencia')} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data início</label>
              <input type="date" required value={form.dataInicio} onChange={set('dataInicio')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data fim (opcional)</label>
              <input type="date" value={form.dataFim} onChange={set('dataFim')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
            <select value={form.categoriaId} onChange={set('categoriaId')} className={inputCls}>
              <option value="">Sem categoria</option>
              {catsFiltradas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
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
              Criar recorrência
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
