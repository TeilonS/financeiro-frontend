import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Loader2, ShieldCheck, Scale } from 'lucide-react'
import StatCard from '../components/StatCard'
import { SkeletonStatCard } from '../components/SkeletonCard'
import { resumo, listar } from '../api/lancamentos'
import { evolucao, topCategorias, previsao as fetchPrevisao } from '../api/relatorios'
import * as usuarioApi from '../api/usuario'
import * as orcamentosApi from '../api/orcamentos'
import { fmt, MESES, yAxisFmt } from '../utils/formatters'
import { useMonthNavigation } from '../hooks/useMonthNavigation'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#111111] rounded-xl shadow-2xl border border-zinc-100 dark:border-white/5 p-4 text-sm backdrop-blur-md">
      <p className="font-bold text-zinc-900 dark:text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {p.name === 'Receita' ? 'Receitas' : 'Despesas'}: <span className="text-zinc-900 dark:text-white">{fmt(p.value)}</span>
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
            <Cell fill="#88888820" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-zinc-900 dark:text-white">{value}%</span>
        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Precisão</span>
      </div>
    </div>
  )
}

function CircularBudget({ name, current, limit, percent }) {
  const data = [{ value: percent }, { value: 100 - percent }]
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={22} outerRadius={28} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
              <Cell fill={percent > 100 ? '#EF4444' : '#10b981'} />
              <Cell fill="#88888815" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-400">{Math.round(percent)}%</span>
        </div>
      </div>
      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2">{name}</p>
    </div>
  )
}

export default function Dashboard() {
  const { mes, ano, mesLabel, nextMes, prevMes } = useMonthNavigation()
  const [loading, setLoading] = useState(true)
  const [healthScore, setHealthScore] = useState(0)
  const [dadosResumo, setDadosResumo] = useState({ totalReceitas: 0, totalDespesas: 0, saldo: 0 })
  const [dadosEvolucao, setDadosEvolucao] = useState([])
  const [dadosCategorias, setDadosCategorias] = useState([])
  const [patrimonio, setPatrimonio] = useState(null)
  const [orcamentos, setOrcamentos] = useState([])
  const [previsao, setPrevisao] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [resResumo, resEvo, resCats, resPat, resOrc, resPrev] = await Promise.all([
          resumo(mes, ano),
          evolucao(ano),
          topCategorias({ mes, ano, tipo: 'DESPESA' }),
          usuarioApi.patrimonio(),
          orcamentosApi.listar(mes, ano),
          fetchPrevisao(mes, ano)
        ])
        setDadosResumo(resResumo.data)
        setDadosEvolucao((resEvo.data.meses || []).map(m => ({ ...m, nomeMes: m.nomeMes.substring(0, 3) })))
        setDadosCategorias(resCats.data || [])
        setPatrimonio(resPat.data)
        setOrcamentos(resOrc.data || [])
        setPrevisao(resPrev.data)
        
        const rec = resResumo.data.totalReceitas || 0
        const desp = resResumo.data.totalDespesas || 0
        setHealthScore(rec > 0 ? Math.min(100, Math.round(((rec - desp) / rec) * 100)) : 0)
      } catch { toast.error('Erro ao carregar dados.') }
      finally { setLoading(false) }
    }
    load()
  }, [mes, ano])

  if (loading) return <div className="p-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></div></div>

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 items-center">
        <div className="md:col-span-4">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Visão Geral Inteligente</p>
          <h1 className="font-sans text-4xl font-bold text-zinc-900 dark:text-white tracking-tighter">{fmt(dadosResumo.saldo)}</h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="flex items-center gap-1 text-zinc-500 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-white/5 px-2 py-1 rounded-lg">
                <button onClick={prevMes} className="p-0.5 hover:text-primary-500 transition-colors"><ChevronLeft size={16} /></button>
                <span className="text-[10px] font-bold uppercase tracking-widest min-w-[100px] text-center">{mesLabel}</span>
                <button onClick={nextMes} className="p-0.5 hover:text-primary-500 transition-colors"><ChevronRight size={16} /></button>
             </div>
          </div>
        </div>
        
        <div className="md:col-span-5 flex justify-center gap-8">
          {orcamentos.slice(0, 2).map(o => (
            <CircularBudget key={o.id} name={o.categoriaNome} current={o.valorGasto} limit={o.valorLimite} percent={o.percentualUsado} />
          ))}
        </div>

        <div className="md:col-span-3 text-right">
           <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Projeção Mensal</p>
           <p className="text-xl font-bold text-zinc-900 dark:text-white">{previsao ? fmt(previsao.saldoProjetado) : '---'}</p>
           <div className="flex justify-end gap-2 mt-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">IA Calculando</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Receitas Totais" value={fmt(dadosResumo.totalReceitas)} icon={TrendingUp} color="emerald" trend={12} />
              <StatCard label="Despesas Totais" value={fmt(dadosResumo.totalDespesas)} icon={TrendingDown} color="red" trend={-5} />
              <StatCard label="Lucro Líquido" value={fmt(dadosResumo.saldo)} icon={Wallet} color="primary" />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Evolução do Fluxo de Caixa</h2>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Acompanhamento de performance mensal</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-zinc-500 uppercase">Receitas</span></div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary-500" /><span className="text-[10px] font-bold text-zinc-500 uppercase">Despesas</span></div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosEvolucao} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#88888810" vertical={false} />
                    <XAxis dataKey="nomeMes" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} tickFormatter={yAxisFmt} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="totalReceitas" name="Receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="totalDespesas" name="Despesa" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {patrimonio && (
              <div className="bg-primary-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
                <Scale size={80} className="absolute top-0 right-0 p-8 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Patrimônio Líquido</p>
                <h2 className="text-4xl font-bold mb-8 tabular-nums">{fmt(patrimonio.patrimonioLiquido)}</h2>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Reserva</p>
                      <p className="text-sm font-bold mt-1">{fmt(patrimonio.reservaEmergencia)}</p>
                   </div>
                   <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Investido</p>
                      <p className="text-sm font-bold mt-1">{fmt(patrimonio.totalInvestimentos)}</p>
                   </div>
                   <div className="bg-black/10 p-3 rounded-2xl backdrop-blur-sm col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Dívidas</p>
                      <p className="text-sm font-bold mt-1">{fmt(patrimonio.totalFaturas)}</p>
                   </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Assistente de IA</h3>
                  <div className="p-1.5 bg-primary-500/10 rounded-lg"><ShieldCheck size={14} className="text-primary-500" /></div>
               </div>
               <AIGauge value={healthScore} />
               <div className="mt-8">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed text-center px-4 font-medium">
                    {healthScore > 70 ? "Sua saúde financeira está excelente! Você está poupando bem." : healthScore > 40 ? "Bom equilíbrio, mas atenção aos gastos extras esta semana." : "Aviso: Suas despesas estão muito próximas da sua renda total."}
                  </p>
               </div>
            </div>
          </div>
      </div>
    </div>
  )
}
