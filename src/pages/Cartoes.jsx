import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, CreditCard, AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import * as cartoesApi from '../api/cartoes'
import { fmt } from '../utils/formatters'

const CORES = ['#EF4444', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

const EMPTY = { nome: '', limite: '', faturaAtual: '', diaVencimento: '', cor: '#EF4444' }

const inputCls = 'w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'

export default function Cartoes() {
  const [cartoes, setCartoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletandoId, setDeletandoId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const res = await cartoesApi.listar()
      setCartoes(res.data || [])
    } catch { setError('Erro ao carregar cartões.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  function openNew() { setEditando(null); setForm(EMPTY); setFormError(''); setModalOpen(true) }
  function openEdit(c) {
    setEditando(c)
    setForm({ nome: c.nome, limite: String(c.limite), faturaAtual: String(c.faturaAtual ?? 0), diaVencimento: String(c.diaVencimento), cor: c.cor || '#EF4444' })
    setFormError(''); setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      const payload = { nome: form.nome, limite: parseFloat(form.limite), faturaAtual: parseFloat(form.faturaAtual || 0), diaVencimento: parseInt(form.diaVencimento), cor: form.cor }
      if (editando) await cartoesApi.atualizar(editando.id, payload)
      else await cartoesApi.criar(payload)
      setModalOpen(false); load()
    } catch (err) { setFormError(err.response?.data?.mensagem || 'Erro ao salvar.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id) {
    try { await cartoesApi.deletar(id); setDeletandoId(null); load() }
    catch { setError('Erro ao excluir cartão.') }
  }

  const totalFaturas = cartoes.reduce((s, c) => s + (c.faturaAtual || 0), 0)
  const totalLimite = cartoes.reduce((s, c) => s + (c.limite || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-zinc-900 dark:text-white">Cartões de Crédito</h1>
          <p className="text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 text-sm mt-0.5">Acompanhe faturas e limites</p>
        </div>
        <button onClick={openNew} className="bg-primary-600 hover:bg-primary-700 text-zinc-900 dark:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={16} /> Novo cartão
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {cartoes.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-1">Total de Faturas</p>
            <p className="text-2xl font-bold text-red-500">{fmt(totalFaturas)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-1">Limite Total Disponível</p>
            <p className="text-2xl font-bold text-emerald-600">{fmt(totalLimite - totalFaturas)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
      ) : cartoes.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center py-16 text-zinc-400 dark:text-zinc-500 dark:text-zinc-500">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum cartão cadastrado</p>
          <p className="text-sm mt-1">Adicione um cartão para acompanhar suas faturas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartoes.map(c => {
            const pct = c.limite > 0 ? Math.min((c.faturaAtual / c.limite) * 100, 100) : 0
            const venceEm = (() => {
              const hoje = new Date()
              const venc = new Date(hoje.getFullYear(), hoje.getMonth(), c.diaVencimento)
              if (venc < hoje) venc.setMonth(venc.getMonth() + 1)
              return Math.ceil((venc - hoje) / 86400000)
            })()
            return (
              <div key={c.id} className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.cor + '20' }}>
                      <CreditCard size={20} style={{ color: c.cor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{c.nome}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-500">
                        Vence dia {c.diaVencimento} · {venceEm <= 3 ? <span className="text-red-500 font-medium">{venceEm}d</span> : `${venceEm}d`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {deletandoId === c.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(c.id)} className="text-xs text-zinc-900 dark:text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg">Sim</button>
                        <button onClick={() => setDeletandoId(null)} className="text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-lg">Não</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 hover:text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400 dark:text-zinc-500 dark:text-zinc-500"><Pencil size={14} /></button>
                        <button onClick={() => setDeletandoId(c.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 hover:text-red-500"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 mb-1.5">
                    <span>Fatura: <strong className="text-zinc-800 dark:text-zinc-200">{fmt(c.faturaAtual)}</strong></span>
                    <span>Limite: {fmt(c.limite)}</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : c.cor }} />
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-500 mt-1 text-right">{pct.toFixed(0)}% utilizado</p>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 dark:text-zinc-500 dark:text-zinc-500">Disponível</span>
                  <span className="font-semibold text-emerald-600">{fmt(c.limiteDisponivel)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar cartão' : 'Novo cartão'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nome do cartão</label>
            <input type="text" required value={form.nome} onChange={set('nome')} placeholder="Ex: Nubank, Itaú Platinum..." className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Limite (R$)</label>
              <input type="number" required min="0" step="0.01" value={form.limite} onChange={set('limite')} placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Fatura atual (R$)</label>
              <input type="number" min="0" step="0.01" value={form.faturaAtual} onChange={set('faturaAtual')} placeholder="0,00" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Dia do vencimento</label>
            <input type="number" required min="1" max="31" value={form.diaVencimento} onChange={set('diaVencimento')} placeholder="Ex: 10" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {CORES.map(cor => (
                <button key={cor} type="button" onClick={() => setForm(f => ({ ...f, cor }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.cor === cor ? 'border-zinc-300 dark:border-zinc-700 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: cor }} />
              ))}
            </div>
          </div>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={formLoading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-zinc-900 dark:text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              {editando ? 'Salvar' : 'Criar cartão'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
