import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, TrendingUp, AlertCircle, History, Landmark, DollarSign } from 'lucide-react'
import Modal from '../components/Modal'
import * as investimentosApi from '../api/investimentos'
import { fmt } from '../utils/formatters'

const TIPOS = [
  { value: 'RENDA_FIXA', label: 'Renda Fixa' },
  { value: 'ACOES', label: 'Ações' },
  { value: 'FII', label: 'FIIs' },
  { value: 'CRYPTO', label: 'Cripto' },
  { value: 'OUTROS', label: 'Outros' }
]

const EMPTY = { nome: '', instituicao: '', tipo: 'RENDA_FIXA' }
const EMPTY_SNAPSHOT = { mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), valor: '' }

const inputCls = 'w-full px-4 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'

export default function Investimentos() {
  const [investimentos, setInvestimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formLoading, setFormLoading] = useState(false)
  
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false)
  const [selectedInv, setSelectedInv] = useState(null)
  const [snapshotForm, setSnapshotForm] = useState(EMPTY_SNAPSHOT)
  
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historico, setHistorico] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await investimentosApi.listar()
      setInvestimentos(res.data || [])
    } catch { setError('Erro ao carregar investimentos.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault(); setFormLoading(true)
    try {
      await investimentosApi.criar(form)
      setModalOpen(false); load()
    } catch (err) { setError('Erro ao criar investimento.') }
    finally { setFormLoading(false) }
  }

  async function handleSnapshotSubmit(e) {
    e.preventDefault(); setFormLoading(true)
    try {
      await investimentosApi.registrarSnapshot(selectedInv.id, {
        ...snapshotForm,
        valor: parseFloat(snapshotForm.valor)
      })
      setSnapshotModalOpen(false); load()
    } catch (err) { setError('Erro ao registrar saldo.') }
    finally { setFormLoading(false) }
  }

  async function openHistory(inv) {
    setSelectedInv(inv); setHistoryModalOpen(true); setHistoryLoading(true)
    try {
      const res = await investimentosApi.listarHistorico(inv.id)
      setHistorico(res.data || [])
    } catch { setError('Erro ao carregar histórico.') }
    finally { setHistoryLoading(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Deseja realmente excluir este investimento?')) return
    try { await investimentosApi.deletar(id); load() }
    catch { setError('Erro ao excluir investimento.') }
  }

  const totalInvestido = investimentos.reduce((s, i) => s + (i.saldoAtual || 0), 0)

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#050505]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-sans text-3xl font-bold text-white tracking-tight">Investimentos</h1>
          <p className="text-zinc-500 text-sm mt-2">Gestão de patrimônio e evolução mensal</p>
        </div>
        <button 
          onClick={() => { setForm(EMPTY); setModalOpen(true) }} 
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-500/10 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Investimento
        </button>
      </div>

      {investimentos.length > 0 && (
        <div className="bg-primary-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20 mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Patrimônio Total Investido</p>
          <h2 className="text-4xl font-bold tabular-nums">{fmt(totalInvestido)}</h2>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : investimentos.length === 0 ? (
        <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 text-center py-20 text-zinc-500">
          <Landmark size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold text-white mb-1">Nenhum investimento registrado</p>
          <p className="text-sm">Comece adicionando seus ativos de renda fixa, ações ou cripto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investimentos.map(i => (
            <div key={i.id} className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6 hover:border-white/10 transition-colors group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-primary-400 border border-white/5">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{i.nome}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{i.instituicao}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openHistory(i)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors">
                    <History size={16} />
                  </button>
                  <button onClick={() => handleDelete(i.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Saldo Atual</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-white tabular-nums">{fmt(i.saldoAtual)}</p>
                    <button 
                      onClick={() => { setSelectedInv(i); setSnapshotForm(EMPTY_SNAPSHOT); setSnapshotModalOpen(true) }}
                      className="text-[10px] font-bold text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors"
                    >
                      Atualizar Saldo
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-white/5">
                    {TIPOS.find(t => t.value === i.tipo)?.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Novo Investimento */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Investimento">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Nome do Ativo</label>
            <input type="text" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Tesouro Selic 2029" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Instituição</label>
            <input type="text" required value={form.instituicao} onChange={e => setForm({...form, instituicao: e.target.value})} placeholder="Ex: NuInvest, XP, Binance" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Tipo</label>
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className={inputCls}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <button type="submit" disabled={formLoading} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {formLoading && <Loader2 size={16} className="animate-spin" />}
            Salvar Investimento
          </button>
        </form>
      </Modal>

      {/* Modal Atualizar Saldo (Snapshot) */}
      <Modal open={snapshotModalOpen} onClose={() => setSnapshotModalOpen(false)} title={`Atualizar Saldo: ${selectedInv?.nome}`}>
        <form onSubmit={handleSnapshotSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Mês</label>
              <input type="number" required min="1" max="12" value={snapshotForm.mes} onChange={e => setSnapshotForm({...snapshotForm, mes: parseInt(e.target.value)})} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Ano</label>
              <input type="number" required min="2000" value={snapshotForm.ano} onChange={e => setSnapshotForm({...snapshotForm, ano: parseInt(e.target.value)})} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Saldo no Período (R$)</label>
            <input type="number" required step="0.01" value={snapshotForm.valor} onChange={e => setSnapshotForm({...snapshotForm, valor: e.target.value})} placeholder="0.00" className={inputCls} />
          </div>
          <button type="submit" disabled={formLoading} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {formLoading && <Loader2 size={16} className="animate-spin" />}
            Confirmar Saldo
          </button>
        </form>
      </Modal>

      {/* Modal Histórico */}
      <Modal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title="Histórico de Evolução">
        <div className="p-2 space-y-4 max-h-[400px] overflow-y-auto">
          {historyLoading ? (
            <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary-500" /></div>
          ) : historico.length === 0 ? (
            <p className="text-center py-10 text-zinc-500 text-sm italic">Nenhum histórico registrado.</p>
          ) : (
            historico.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.mes < 10 ? '0'+s.mes : s.mes}/{s.ano}</p>
                  <p className="text-sm font-bold text-white">{fmt(s.valor)}</p>
                </div>
                <TrendingUp size={16} className="text-emerald-500 opacity-50" />
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
