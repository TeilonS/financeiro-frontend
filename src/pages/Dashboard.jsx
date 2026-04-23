import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Loader2, ShieldCheck, Pencil, Check, X, Scale, Bell, BellOff, BellRing } from 'lucide-react'
import StatCard from '../components/StatCard'
import { SkeletonStatCard } from '../components/SkeletonCard'
import { resumo, listar } from '../api/lancamentos'
import { evolucao, topCategorias, previsao as fetchPrevisao } from '../api/relatorios'
import * as usuarioApi from '../api/usuario'
import * as orcamentosApi from '../api/orcamentos'
import { fmt, formatDate, MESES, yAxisFmt } from '../utils/formatters'
import { useMonthNavigation } from '../hooks/useMonthNavigation'
import { usePushNotification } from '../hooks/usePushNotification'

// Cores para o novo tema Coral
const CORAL_COLORS = ['#EF4444', '#F87171', '#FC8181', '#FCA5A5', '#FECACA', '#FEE2E2']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111111] rounded-xl shadow-2xl border border-white/5 p-4 text-sm backdrop-blur-md">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <p className="text-zinc-400 font-medium">
            {p.name}: <span className="text-white">{fmt(p.value)}</span>
          </p>
        </div>
      ))}
    </div>
  )
}


function AIGauge({ value }) {
  const data = [{ value }, { value: 100 - value }]
  return (
    <div className="relative w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={40} outerRadius={50} startAngle={225} endAngle={-45} dataKey="value" stroke="none">
            <Cell fill="#EF4444" />
            <Cell fill="#1F1F1F" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{value}%</span>
        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Accuracy</span>
      </div>
    </div>
  )
}

function CircularBudget({ name, current, limit, percent }) {
  const data = [
    { value: Math.min(percent, 100) },
    { value: Math.max(0, 100 - percent) }
  ]
  const color = percent >= 100 ? '#EF4444' : percent >= 80 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={35}
              outerRadius={45}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#1F1F1F" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-center flex-col items-center justify-center">
          <span className="text-sm font-bold text-white leading-none">{percent}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{name}</p>
        <p className="text-xs font-medium text-white">{fmt(current)}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { mes, ano, prevMes, nextMes } = useMonthNavigation()
  const { status: pushStatus, ativar: ativarPush, desativar: desativarPush } = usePushNotification()
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
  const [healthScore, setHealthScore] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      const params = { mes, ano }

      try {
        const [resResumo, resLanc] = await Promise.all([
          resumo(params),
          listar({ ...params, size: 5, sort: 'data,desc' }),
        ])
        setDadosResumo(resResumo.data)
        const lancArr = Array.isArray(resLanc.data) ? resLanc.data : resLanc.data?.content || []
        setRecentesLancamentos(lancArr.slice(0, 5))
      } catch {
        setError('Erro ao carregar dados do dashboard.')
      } finally {
        setLoading(false)
      }

      Promise.all([
        evolucao(ano),
        topCategorias({ ...params, tipo: 'DESPESA', limit: 6 }),
        usuarioApi.getReserva(),
        usuarioApi.patrimonio(),
        fetchPrevisao(mes, ano),
        orcamentosApi.listar(mes, ano),
      ]).then(([resEvolucao, resCats, resReserva, resPatrimonio, resPrev, resOrc]) => {
        const meses = resEvolucao.data?.meses || []
        setDadosEvolucao(meses.map(item => ({ ...item, nomeMes: (item.nomeMes || '').substring(0, 3).toUpperCase() })))
        setDadosCategorias(resCats.data || [])
        setReserva(resReserva.data?.valor ?? 0)
        setPatrimonio(resPatrimonio.data)
        setPrevisao(resPrev.data)
                setOrcamentos(resOrc.data || [])
        
        // Cálculo de Saúde Financeira (0-100)
        const receitas = resResumo.data.totalReceitas || 0
        const despesas = resResumo.data.totalDespesas || 0
        if (receitas > 0) {
          const score = Math.max(0, Math.min(100, Math.round(((receitas - despesas) / receitas) * 100)))
          setHealthScore(score)
        } else {
          setHealthScore(0)
        }
      }).catch(() => {})
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
    } catch { toast.error('Erro ao salvar reserva de emergência.') }
  }

  const mesLabel = `${MESES[mes - 1]} ${ano}`

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#050505]">
      {/* Top Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 items-center">
        <div className="md:col-span-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Intelligent Overview</p>
          <h1 className="font-sans text-4xl font-bold text-white tracking-tighter">{fmt(dadosResumo.saldo)}</h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="flex items-center gap-1 text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-lg border border-white/5">
                <button onClick={prevMes} className="p-0.5 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                <span className="text-[10px] font-bold uppercase tracking-widest min-w-[100px] text-center">{mesLabel}</span>
                <button onClick={nextMes} className="p-0.5 hover:text-white transition-colors"><ChevronRight size={16} /></button>
             </div>
          </div>
        </div>
        
        <div className="md:col-span-5 flex justify-center gap-8">
          {orcamentos.slice(0, 2).map(o => (
            <CircularBudget key={o.id} name={o.categoriaNome} current={o.valorGasto} limit={o.valorLimite} percent={o.percentualUsado} />
          ))}
        </div>

        <div className="md:col-span-3 text-right">
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Monthly Projection</p>
           <p className="text-xl font-bold text-white">{previsao ? fmt(previsao.saldoProjetado) : '---'}</p>
           <div className="flex justify-end gap-2 mt-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">IA Calculating</span>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-2xl mb-8 flex items-center gap-3">
          <X size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Income" value={fmt(dadosResumo.totalReceitas)} icon={TrendingUp} color="emerald" trend={12} />
              <StatCard label="Total Expenses" value={fmt(dadosResumo.totalDespesas)} icon={TrendingDown} color="red" trend={-5} />
              <StatCard label="Net Profit" value={fmt(dadosResumo.saldo)} icon={Wallet} color="primary" />
            </div>

            {/* Main Area Chart */}
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white">Cash Flow Evolution</h2>
                  <p className="text-sm text-zinc-500 mt-1">Monthly performance tracking</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Incomes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Expenses</span>
                  </div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosEvolucao} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs><CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="nomeMes" 
                      tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={15}
                    />
                    <YAxis 
                      tickFormatter={yAxisFmt} 
                      tick={{ fontSize: 10, fill: '#525252', fontWeight: 'bold' }} 
                      axisLine={false} 
                      tickLine={false} 
                      width={60} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 1 }} />
                    <Area 
                      type="monotone" 
                      dataKey="totalReceitas" 
                      name="Income"
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalDespesas" 
                      name="Expense"
                      stroke="#EF4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Grid: Recent Activity + Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Recent Transactions</h3>
                  <div className="space-y-4">
                    {recentesLancamentos.map((l) => (
                      <div key={l.id} className="flex items-center justify-between group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${l.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'}`}>
                            {l.tipo === 'RECEITA' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{l.descricao}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{l.categoriaNome || 'Other'}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold tabular-nums ${l.tipo === 'RECEITA' ? 'text-emerald-500' : 'text-white'}`}>
                          {fmt(l.valor)}
                        </p>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">AI Assistant</h3>
                    <div className="p-1.5 bg-primary-500/10 rounded-lg"><ShieldCheck size={14} className="text-primary-500" /></div>
                  </div>
                  <AIGauge value={healthScore} />
                  <div className="mt-8 space-y-3">
                    <p className="text-[10px] text-zinc-500 leading-relaxed text-center px-4">
                      {healthScore > 70 
                      ? "Your financial health is excellent! You are saving a good portion of your income." 
                      : healthScore > 40 
                      ? "Good balance, but watch out for elective expenses this week." 
                      : "Warning: Your expenses are very close to your total income."}
                    </p>
                  </div>
               </div>

               <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Spending by Category</h3>
                  <div className="space-y-5 mt-4">
                    {dadosCategorias.slice(0, 4).map((cat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-zinc-400">{cat.categoriaNome}</span>
                          <span className="text-white">{cat.percentual}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${cat.percentual}%`, backgroundColor: CORAL_COLORS[i % CORAL_COLORS.length] }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Patrimonio Card */}
            {patrimonio && (
              <div className="bg-primary-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Scale size={80} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Net Worth</p>
                <h2 className="text-4xl font-bold mb-8 tabular-nums">{fmt(patrimonio.patrimonioLiquido)}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Reserve</p>
                      <p className="text-sm font-bold mt-1">{fmt(patrimonio.reservaEmergencia)}</p>
                   </div>
                   <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Invested</p>
                      <p className="text-sm font-bold mt-1">{fmt(patrimonio.totalInvestimentos)}</p>
                   </div>
                   <div className="bg-black/10 p-3 rounded-2xl backdrop-blur-sm col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Debts</p>
                      <p className="text-sm font-bold mt-1">{fmt(patrimonio.totalFaturas)}</p>
                   </div>
                </div>
              </div>
            )}

            {/* Projection Card */}
            {previsao && (
              <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Monthly Projection</h3>
                    <TrendingUp size={16} className="text-primary-400" />
                 </div>
                 
                 <p className="text-3xl font-bold text-white mb-6 tabular-nums">{fmt(previsao.saldoProjetado)}</p>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-zinc-500">Current Balance</span>
                       <span className="text-xs font-bold text-white">{fmt(previsao.saldoAtual)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-zinc-500">Pending Incomes</span>
                       <span className="text-xs font-bold text-emerald-500">+{fmt(previsao.receitasPendentes)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-zinc-500">Pending Expenses</span>
                       <span className="text-xs font-bold text-primary-400">-{fmt(previsao.despesasPendentes)}</span>
                    </div>
                 </div>
                 
                 <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progress</span>
                       <span className="text-xs font-bold text-white">{Math.round((previsao.diasPassados / previsao.totalDiasMes) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-primary-500 rounded-full" 
                         style={{ width: `${(previsao.diasPassados / previsao.totalDiasMes) * 100}%` }} 
                       />
                    </div>
                 </div>
              </div>
            )}

            {/* Emergency Reserve Manager */}
            <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Emergency Fund</h3>
                <ShieldCheck size={16} className="text-zinc-500" />
              </div>
              
              {editandoReserva ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus type="number"
                    value={reservaInput} onChange={e => setReservaInput(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <button onClick={salvarReserva} className="p-2 bg-primary-500 rounded-xl"><Check size={16} className="text-white" /></button>
                </div>
              ) : (
                <div className="flex items-end justify-between group">
                   <div>
                      <p className="text-3xl font-bold text-white tabular-nums">{fmt(reserva)}</p>
                      <p className="text-xs font-medium text-zinc-500 mt-1">Safety target achieved</p>
                   </div>
                   <button 
                     onClick={() => { setReservaInput(String(reserva)); setEditandoReserva(true) }}
                     className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-xl"
                   >
                     <Pencil size={14} className="text-zinc-500" />
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
