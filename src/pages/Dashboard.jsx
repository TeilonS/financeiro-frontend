import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Loader2, ShieldCheck, Pencil, Check, X, Scale, Bell } from 'lucide-react'
import StatCard from '../components/StatCard'
import { SkeletonStatCard } from '../components/SkeletonCard'
import { resumo, listar } from '../api/lancamentos'
import { evolucao, topCategorias, previsao as fetchPrevisao } from '../api/relatorios'
import * as usuarioApi from '../api/usuario'
import * as orcamentosApi from '../api/orcamentos'
import { fmt, formatDate, MESES, yAxisFmt } from '../utils/formatters'
import { useMonthNavigation } from '../hooks/useMonthNavigation'

const COLORS = ['#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function CustomTooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-800 p-3 text-sm">
      <p className="font-semibold text-zinc-200 mb-1">{label}</p>
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
    <div className="bg-zinc-800 rounded-xl shadow-lg border border-zinc-800 p-3 text-sm">
      <p className="font-semibold text-zinc-200">{payload[0].name}</p>
      <p className="text-zinc-300">{fmt(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { mes, ano, prevMes, nextMes } = useMonthNavigation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dadosResumo, setDadosResumo] = useState({ totalReceitas: 0, totalDespesas: 0, saldo: 0 })
  const [dadosEvolucao, setDadosEvolucao] = useState([])
  const [dadosCategorias, setDadosCategorias] = useState([])
  const [recentesLancamentos, setRecentesLancamentos] = useState([])
  const [reserva, setReserva] = useState(0)
  const [editandoReserva, setEditandoReserva] = useState(false)
  const [reservaInput, setReservaInput] = useState('')
  const [patrimonio, setPatrimonio] = useState(null)
  const [previsao, setPrevisao] = useState(null)
  const [orcamentos, setOrcamentos] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const params = { mes, ano }
        const [resResumo, resEvolucao, resCats, resLanc, resReserva, resPatrimonio, resPrev, resOrc] = await Promise.all([
          resumo(params),
          evolucao(ano),
          topCategorias({ ...params, tipo: 'DESPESA', limit: 6 }),
          listar({ ...params, size: 5, sort: 'data,desc' }),
          usuarioApi.getReserva(),
          usuarioApi.patrimonio(),
          fetchPrevisao(mes, ano),
          orcamentosApi.listar(mes, ano),
        ])
        setDadosResumo(resResumo.data)
        const meses = resEvolucao.data?.meses || []
        setDadosEvolucao(meses.map(item => ({ ...item, nomeMes: (item.nomeMes || '').substring(0, 3) })))
        setDadosCategorias(resCats.data || [])
        const lancArr = Array.isArray(resLanc.data) ? resLanc.data : resLanc.data?.content || []
        setRecentesLancamentos(lancArr.slice(0, 5))
        setReserva(resReserva.data?.valor ?? 0)
        setPatrimonio(resPatrimonio.data)
        setPrevisao(resPrev.data)
        setOrcamentos(resOrc.data || [])
      } catch {
        setError('Erro ao carregar dados do dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mes, ano])

  async function salvarReserva() {
    const val = parseFloat(reservaInput.replace(',', '.'))
    if (isNaN(val) || val < 0) return
    try {
      const res = await usuarioApi.atualizarReserva(val)
      setReserva(res.data?.valor ?? val)
      setEditandoReserva(false)
    } catch { /* silent */ }
  }

  const mesLabel = `${MESES[mes - 1]} ${ano}`
  const alertasOrcamento = orcamentos.filter(o => o.percentualUsado >= 80)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-1.5 shadow-sm">
          <button onClick={prevMes} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft size={16} className="text-zinc-500" />
          </button>
          <span className="text-sm font-medium text-zinc-200 min-w-[120px] text-center">{mesLabel}</span>
          <button onClick={nextMes} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronRight size={16} className="text-zinc-500" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Alertas de orçamento */}
      {alertasOrcamento.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={15} className="text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {alertasOrcamento.filter(o => o.percentualUsado >= 100).length > 0
                ? 'Orçamentos ultrapassados!'
                : 'Orçamentos próximos do limite'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertasOrcamento.map(o => (
              <span key={o.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                o.percentualUsado >= 100
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }`}>
                {o.categoriaNome}: {o.percentualUsado}%
              </span>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Receitas" value={fmt(dadosResumo.totalReceitas)} icon={TrendingUp} color="emerald" />
            <StatCard label="Despesas" value={fmt(dadosResumo.totalDespesas)} icon={TrendingDown} color="red" />
            <StatCard label="Saldo" value={fmt(dadosResumo.saldo)} icon={Wallet} color="primary" />
          </div>

          {/* Patrimônio + Previsão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {patrimonio && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                    <Scale size={16} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">Patrimônio Líquido</span>
                </div>
                <p className={`text-2xl font-bold mb-2 ${patrimonio.patrimonioLiquido >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-500'}`}>
                  {fmt(patrimonio.patrimonioLiquido)}
                </p>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Reserva: <strong className="text-emerald-600">{fmt(patrimonio.reservaEmergencia)}</strong></span>
                  <span>Faturas: <strong className="text-red-500">{fmt(patrimonio.totalFaturas)}</strong></span>
                </div>
              </div>
            )}

            {previsao && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                      <TrendingUp size={16} className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-200">Projeção do Mês</span>
                  </div>
                  <span className="text-xs text-zinc-500">dia {previsao.diasPassados}/{previsao.totalDiasMes}</span>
                </div>

                {/* Saldo projetado */}
                <p className={`text-2xl font-bold mb-3 ${previsao.saldoProjetado >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-red-500'}`}>
                  {fmt(previsao.saldoProjetado)}
                </p>

                {/* Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Saldo atual</span>
                    <span className={previsao.saldoAtual >= 0 ? 'text-zinc-300 font-medium' : 'text-red-500 font-medium'}>
                      {fmt(previsao.saldoAtual)}
                    </span>
                  </div>
                  {previsao.recorrenciasPendentes > 0 && (
                    <>
                      {previsao.receitasPendentes > 0 && (
                        <div className="flex justify-between text-zinc-500">
                          <span>+ Entradas previstas</span>
                          <span className="text-emerald-600 font-medium">+{fmt(previsao.receitasPendentes)}</span>
                        </div>
                      )}
                      {previsao.despesasPendentes > 0 && (
                        <div className="flex justify-between text-zinc-500">
                          <span>− Saídas previstas</span>
                          <span className="text-red-500 font-medium">−{fmt(previsao.despesasPendentes)}</span>
                        </div>
                      )}
                      <div className="pt-1 border-t border-zinc-800 text-zinc-500">
                        {previsao.recorrenciasPendentes} recorrência{previsao.recorrenciasPendentes !== 1 ? 's' : ''} pendente{previsao.recorrenciasPendentes !== 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                  {previsao.recorrenciasPendentes === 0 && (
                    <div className="text-zinc-500">Todas as recorrências já geradas</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reserva de Emergência */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-zinc-200">Reserva de Emergência</span>
              </div>
              {!editandoReserva && (
                <button
                  onClick={() => { setReservaInput(String(reserva)); setEditandoReserva(true) }}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Pencil size={13} className="text-zinc-500" />
                </button>
              )}
            </div>
            {editandoReserva ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">R$</span>
                <input
                  autoFocus type="number" min="0" step="0.01"
                  value={reservaInput} onChange={e => setReservaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') salvarReserva(); if (e.key === 'Escape') setEditandoReserva(false) }}
                  className="flex-1 px-3 py-1.5 border border-zinc-700 rounded-xl text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button onClick={salvarReserva} className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg">
                  <Check size={13} />
                </button>
                <button onClick={() => setEditandoReserva(false)} className="p-1.5 hover:bg-zinc-800 rounded-lg">
                  <X size={13} className="text-zinc-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmt(reserva)}</p>
                {dadosResumo.totalDespesas > 0 && (
                  <p className="text-xs text-zinc-500 mb-1">
                    ≈ {(reserva / (dadosResumo.totalDespesas / mes)).toFixed(1)} meses cobertos
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4">Evolução Anual {ano}</h2>
              {dadosEvolucao.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Sem dados para exibir</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dadosEvolucao} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nomeMes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={yAxisFmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip content={<CustomTooltipBar />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="totalReceitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalDespesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4">Top Despesas do Mês</h2>
              {dadosCategorias.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Sem dados</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={dadosCategorias} dataKey="total" nameKey="categoriaNome" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                        {dadosCategorias.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-1.5">
                    {dadosCategorias.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-zinc-400 truncate">{cat.categoriaNome}</span>
                        </div>
                        <span className="text-zinc-500 ml-2 flex-shrink-0">{cat.percentual}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Orçamentos */}
          {orcamentos.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-4">
              <h2 className="text-sm font-semibold text-zinc-200 mb-4">Orçamentos do Mês</h2>
              <div className="space-y-3">
                {orcamentos.map(o => (
                  <div key={o.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-zinc-300">{o.categoriaNome}</span>
                      <span className="text-zinc-500">{fmt(o.valorGasto)} <span className="text-zinc-500 dark:text-zinc-500">/</span> {fmt(o.valorLimite)}</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(o.percentualUsado, 100)}%`, backgroundColor: o.percentualUsado >= 100 ? '#ef4444' : o.percentualUsado >= 80 ? '#f59e0b' : '#14b8a6' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimos Lançamentos */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Últimos Lançamentos</h2>
            {recentesLancamentos.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">Nenhum lançamento neste mês.</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {recentesLancamentos.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${l.tipo === 'RECEITA' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{l.descricao}</p>
                        <p className="text-xs text-zinc-500">{l.categoriaNome || l.categoria?.nome || '—'} · {formatDate(l.data)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${l.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {l.tipo === 'RECEITA' ? '+' : '-'}{fmt(l.valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
