import { useState, useEffect } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown, Wallet, FileDown } from 'lucide-react'
import * as relApi from '../api/relatorios'
import { fmt, MESES, yAxisFmt } from '../utils/formatters'

const COLORS = ['#EF4444', '#F87171', '#FC8181', '#10b981', '#059669', '#34d399', '#f59e0b', '#8b5cf6']

function CustomTooltipBar({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-700 p-4 text-sm">
      <p className="font-bold text-zinc-900 dark:text-white mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-medium">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function TabEvolucao() {
  const [ano, setAno] = useState(new Date().getFullYear())
  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await relApi.evolucao(ano)
        setDados((res.data?.meses || []).map(item => ({ ...item, nomeMes: item.nomeMes?.substring(0, 3) })))
      } catch { alert('Erro ao carregar evolução.') }
      finally { setLoading(false) }
    }
    load()
  }, [ano])

  const totalReceitas = dados.reduce((s, d) => s + (d.totalReceitas || 0), 0)
  const totalDespesas = dados.reduce((s, d) => s + (d.totalDespesas || 0), 0)
  const saldo = totalReceitas - totalDespesas

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => setAno(a => a - 1)} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"><ChevronLeft size={16} /></button>
        <span className="text-lg font-bold text-zinc-900 dark:text-white min-w-[80px] text-center">{ano}</span>
        <button onClick={() => setAno(a => a + 1)} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"><ChevronRight size={16} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Receitas</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalReceitas)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Despesas</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(totalDespesas)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Saldo no Ano</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-zinc-900 dark:text-white' : 'text-red-600'}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
              <XAxis dataKey="nomeMes" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={yAxisFmt} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltipBar />} />
              <Legend />
              <Bar dataKey="totalReceitas" name="Receita" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="totalDespesas" name="Despesa" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default function Relatorios() {
  const [tab, setTab] = useState('evolucao')
  async function handleExportar() {
    try {
      const now = new Date()
      const res = await relApi.exportar(now.getMonth() + 1, now.getFullYear())
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio_${now.getFullYear()}_${now.getMonth() + 1}.csv`)
      document.body.appendChild(link); link.click(); link.remove()
    } catch { alert('Erro ao exportar.') }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Relatórios</h1>
          <p className="text-zinc-500 text-sm mt-2">Análise detalhada das suas finanças</p>
        </div>
        <button onClick={handleExportar} className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <FileDown size={18} className="text-primary-500" /> Exportar CSV
        </button>
      </div>

      <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 gap-1 mb-10 w-fit shadow-sm">
        {['evolucao', 'top', 'comparativo'].map(id => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-8 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}>
            {id === 'evolucao' ? 'Evolução' : id === 'top' ? 'Categorias' : 'Comparativo'}
          </button>
        ))}
      </div>

      {tab === 'evolucao' && <TabEvolucao />}
    </div>
  )
}
