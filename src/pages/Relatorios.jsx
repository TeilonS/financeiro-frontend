import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import * as relApi from '../api/relatorios'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function yAxisFmt(v) {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`
  return `R$${v}`
}

function CustomTooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function CustomTooltipPie({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-300">{payload[0].name}</p>
      <p className="text-slate-600 dark:text-slate-400">{fmt(payload[0].value)}</p>
      {payload[0].payload?.percentual !== undefined && (
        <p className="text-slate-400 dark:text-slate-500">{payload[0].payload.percentual?.toFixed(1)}%</p>
      )}
    </div>
  )
}

function TabEvolucao() {
  const [ano, setAno] = useState(new Date().getFullYear())
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await relApi.evolucao(ano)
        const evo = (res.data?.meses || []).map(item => ({
          ...item, nomeMes: (item.nomeMes || '').substring(0, 3),
        }))
        setDados(evo)
      } catch { setError('Erro ao carregar evolução.') }
      finally { setLoading(false) }
    }
    load()
  }, [ano])

  const totalReceitas = dados.reduce((s, d) => s + (d.totalReceitas || 0), 0)
  const totalDespesas = dados.reduce((s, d) => s + (d.totalDespesas || 0), 0)
  const saldo = totalReceitas - totalDespesas

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setAno(a => a - 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
        </button>
        <span className="text-base font-semibold text-slate-700 dark:text-slate-300 min-w-[60px] text-center">{ano}</span>
        <button onClick={() => setAno(a => a + 1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Total Receitas</span>
          </div>
          <p className="text-xl font-semibold text-emerald-800 dark:text-emerald-300">{fmt(totalReceitas)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-400 font-medium">Total Despesas</span>
          </div>
          <p className="text-xl font-semibold text-red-800 dark:text-red-300">{fmt(totalDespesas)}</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 border border-primary-100 dark:border-primary-800">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-primary-700 dark:text-primary-400 font-medium">Saldo no Ano</span>
          </div>
          <p className={`text-xl font-semibold ${saldo >= 0 ? 'text-primary-800 dark:text-primary-300' : 'text-red-700 dark:text-red-400'}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      ) : dados.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">Sem dados para {ano}.</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={dados} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="nomeMes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={yAxisFmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={65} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="totalReceitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalDespesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function TabTopCategorias() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [tipo, setTipo] = useState('DESPESA')
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function prevMes() {
    if (mes === 1) { setMes(12); setAno(a => a - 1) } else setMes(m => m - 1)
  }
  function nextMes() {
    if (mes === 12) { setMes(1); setAno(a => a + 1) } else setMes(m => m + 1)
  }

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await relApi.topCategorias({ mes, ano, tipo })
        setDados(res.data || [])
      } catch { setError('Erro ao carregar top categorias.') }
      finally { setLoading(false) }
    }
    load()
  }, [mes, ano, tipo])

  const total = dados.reduce((s, d) => s + (d.total || 0), 0)
  const mesLabel = `${MESES[mes - 1]} ${ano}`

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1.5 shadow-sm">
          <button onClick={prevMes} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft size={16} className="text-slate-500 dark:text-slate-400" />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[120px] text-center">{mesLabel}</span>
          <button onClick={nextMes} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronRight size={16} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-1 gap-1 shadow-sm">
          {['DESPESA', 'RECEITA'].map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tipo === t ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              {t === 'DESPESA' ? 'Despesas' : 'Receitas'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      ) : dados.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">Sem dados para este período.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dados} dataKey="total" nameKey="categoriaNome" cx="50%" cy="50%" innerRadius={65} outerRadius={100}>
                  {dados.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {dados.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{cat.categoriaNome}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">{cat.percentual}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">#</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">Categoria</th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">Valor</th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-5 py-3">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {dados.map((d, i) => {
                  const pct = total > 0 ? (d.total / total) * 100 : 0
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{d.categoriaNome}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-right text-slate-700 dark:text-slate-300">{fmt(d.total)}</td>
                      <td className="px-5 py-3 text-sm text-right text-slate-500 dark:text-slate-400">{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Total</td>
                  <td className="px-5 py-3 text-sm font-semibold text-right text-slate-800 dark:text-white">{fmt(total)}</td>
                  <td className="px-5 py-3 text-sm text-right text-slate-500 dark:text-slate-400">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function TabComparativo() {
  const now = new Date()
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  const [mesAtual, setMesAtual] = useState(now.getMonth() + 1)
  const [anoAtual, setAnoAtual] = useState(now.getFullYear())
  const [mesAnterior, setMesAnterior] = useState(prevMonth)
  const [anoAnterior, setAnoAnterior] = useState(prevYear)
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputCls = 'px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500'

  async function handleComparar() {
    setLoading(true); setError('')
    try {
      const res = await relApi.comparativo({ mesAtual, anoAtual, mesAnterior, anoAnterior })
      setDados(res.data)
    } catch { setError('Erro ao carregar comparativo.') }
    finally { setLoading(false) }
  }

  function variationClass(v, invertido = false) {
    if (v === null || v === undefined || isNaN(v)) return 'text-slate-400'
    if (invertido) return v > 0 ? 'text-red-600' : 'text-emerald-600'
    return v >= 0 ? 'text-emerald-600' : 'text-red-600'
  }

  function variationLabel(v) {
    if (v === null || v === undefined || isNaN(v)) return '—'
    return `${v >= 0 ? '+' : ''}${Number(v).toFixed(1)}%`
  }

  const mesLabelA = `${MESES[(mesAnterior - 1)]} ${anoAnterior}`
  const mesLabelB = `${MESES[(mesAtual - 1)]} ${anoAtual}`

  return (
    <div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Selecionar períodos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Período anterior</p>
            <div className="grid grid-cols-2 gap-3">
              <select value={mesAnterior} onChange={(e) => setMesAnterior(Number(e.target.value))} className={inputCls}>
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" min="2020" max="2099" value={anoAnterior}
                onChange={(e) => setAnoAnterior(Number(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Período atual</p>
            <div className="grid grid-cols-2 gap-3">
              <select value={mesAtual} onChange={(e) => setMesAtual(Number(e.target.value))} className={inputCls}>
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" min="2020" max="2099" value={anoAtual}
                onChange={(e) => setAnoAtual(Number(e.target.value))} className={inputCls} />
            </div>
          </div>
        </div>
        <button onClick={handleComparar} disabled={loading}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Comparar
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

      {dados && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wide px-6 py-4">Indicador</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-6 py-4">{mesLabelA}</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-6 py-4">{mesLabelB}</th>
                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wide px-6 py-4">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">Receitas</td>
                <td className="px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{fmt(dados.anterior?.totalReceitas)}</td>
                <td className="px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{fmt(dados.atual?.totalReceitas)}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${variationClass(dados.variacaoReceitas)}`}>{variationLabel(dados.variacaoReceitas)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">Despesas</td>
                <td className="px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{fmt(dados.anterior?.totalDespesas)}</td>
                <td className="px-6 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{fmt(dados.atual?.totalDespesas)}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${variationClass(dados.variacaoDespesas, true)}`}>{variationLabel(dados.variacaoDespesas)}</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 bg-slate-50/30 dark:bg-slate-800/30">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Saldo</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${(dados.anterior?.saldo ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(dados.anterior?.saldo)}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${(dados.atual?.saldo ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(dados.atual?.saldo)}</td>
                <td className={`px-6 py-4 text-sm text-right font-semibold ${variationClass(dados.variacaoSaldo)}`}>{variationLabel(dados.variacaoSaldo)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'evolucao', label: 'Evolução' },
  { id: 'top', label: 'Top Categorias' },
  { id: 'comparativo', label: 'Comparativo' },
]

export default function Relatorios() {
  const [tab, setTab] = useState('evolucao')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Relatórios</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Análise detalhada das suas finanças</p>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1 shadow-sm mb-6 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'evolucao' && <TabEvolucao />}
      {tab === 'top' && <TabTopCategorias />}
      {tab === 'comparativo' && <TabComparativo />}
    </div>
  )
}
