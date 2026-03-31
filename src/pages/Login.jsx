import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'
import { Loader2 } from 'lucide-react'

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500/40 transition-colors'

export default function Login() {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await authApi.login(form.email, form.senha)
      } else {
        res = await authApi.register(form.nome, form.email, form.senha)
      }
      login(res.data.token, { nome: res.data.nome, email: res.data.email })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">

      {/* Painel esquerdo — brand */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between px-12 py-10 border-r border-zinc-800/60 relative overflow-hidden">
        {/* Grid sutil de fundo */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Marca */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-zinc-900 text-sm">F</span>
            </div>
            <span className="font-display font-bold text-white text-base tracking-tight">Financeiro Pessoal</span>
          </div>

          <div className="space-y-6">
            <p className="font-display font-bold text-white text-3xl xl:text-4xl leading-tight tracking-tight">
              Controle real.<br />
              <span className="text-primary-400">Clareza total.</span>
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Acompanhe receitas, despesas, metas e orçamentos em um só lugar. Sem complexidade desnecessária.
            </p>
          </div>
        </div>

        {/* Métricas decorativas */}
        <div className="relative space-y-3">
          {[
            { label: 'Saldo do mês', value: 'R$ 2.840,00', color: 'text-emerald-400' },
            { label: 'Despesas', value: 'R$ 1.560,00', color: 'text-red-400' },
            { label: 'Meta atingida', value: '73%', color: 'text-primary-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between bg-zinc-800/40 border border-zinc-800 rounded-xl px-4 py-3">
              <span className="text-zinc-500 text-xs">{item.label}</span>
              <span className={`font-mono font-medium text-sm tabular-nums ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Header mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex w-10 h-10 bg-primary-500 rounded-xl items-center justify-center mb-3">
              <span className="font-display font-bold text-zinc-900">F</span>
            </div>
            <p className="font-display font-bold text-white text-xl">Financeiro Pessoal</p>
          </div>

          <div className="mb-6">
            <h1 className="font-display font-bold text-white text-xl tracking-tight">
              {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {mode === 'login' ? 'Acesse seu painel financeiro.' : 'Comece a controlar suas finanças.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Nome</label>
                <input type="text" required value={form.nome} onChange={set('nome')} placeholder="Seu nome" className={inputCls} />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="seu@email.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Senha</label>
              <input type="password" required value={form.senha} onChange={set('senha')} placeholder="••••••••" className={inputCls} />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-900/20 border border-red-900/40 px-3 py-2.5 rounded-lg">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-zinc-600 text-xs mt-6">
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {mode === 'login' ? 'Criar agora' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
