import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'
import api from '../api'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500/40 transition-colors'

export default function Entrar() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot'
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverWaking, setServerWaking] = useState(false)
  const wakingTimer = useRef(null)

  // Pré-aquece o backend (Render dorme após inatividade)
  useEffect(() => {
    api.get('/auth/ping').catch(() => {})
  }, [])

  // Mostra aviso de "iniciando servidor" se o login demorar mais de 3s
  useEffect(() => {
    if (loading) {
      wakingTimer.current = setTimeout(() => setServerWaking(true), 3000)
    } else {
      clearTimeout(wakingTimer.current)
      setServerWaking(false)
    }
    return () => clearTimeout(wakingTimer.current)
  }, [loading])

  if (user) return <Navigate to="/" replace />

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const res = await authApi.login(form.email, form.senha)
        login({ nome: res.data.nome, email: res.data.email })
        navigate('/')
      } else if (mode === 'register') {
        const res = await authApi.register(form.nome, form.email, form.senha)
        login({ nome: res.data.nome, email: res.data.email })
        navigate('/')
      } else {
        await authApi.forgotPassword(form.email, form.senha)
        toast.success('Senha redefinida com sucesso!')
        setMode('login')
      }
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao processar requisição.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex">

      {/* Painel esquerdo — brand */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between px-12 py-12 border-r border-zinc-200 dark:border-white/5 relative overflow-hidden bg-white dark:bg-[#0A0A0A]">
        {/* Marca */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-24">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="font-sans font-bold text-zinc-900 dark:text-white text-lg">F</span>
            </div>
            <span className="font-sans font-bold text-zinc-900 dark:text-white text-xl tracking-tight">Financeiro Intel</span>
          </div>

          <div className="space-y-8">
            <h1 className="font-sans font-bold text-zinc-900 dark:text-white text-4xl xl:text-5xl leading-tight tracking-tight">
              Domine sua<br />
              <span className="text-primary-500">vida financeira.</span>
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed max-w-xs">
              Ferramentas profissionais para evolução financeira. Acompanhe e analise seu patrimônio.
            </p>
          </div>
        </div>

        {/* Métricas decorativas */}
        <div className="relative space-y-4">
          {[
            { label: 'Saldo Mensal', value: 'R$ 2.840,00', color: 'text-emerald-500' },
            { label: 'Despesas Fixas', value: 'R$ 1.560,00', color: 'text-primary-400' },
            { label: 'Meta Financeira', value: '73%', color: 'text-zinc-900 dark:text-white' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{item.label}</span>
              <span className={`font-sans font-bold text-sm tabular-nums ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-[#050505]">
        <div className="w-full max-w-sm">

          {/* Header mobile */}
          <div className="lg:hidden mb-12 text-center">
            <div className="inline-flex w-12 h-12 bg-primary-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
              <span className="font-sans font-bold text-zinc-900 dark:text-white text-xl">F</span>
            </div>
            <p className="font-sans font-bold text-zinc-900 dark:text-white text-2xl">Financeiro Intel</p>
          </div>

          <div className="mb-8">
            <h1 className="font-sans font-bold text-zinc-900 dark:text-white text-2xl tracking-tight">
              {mode === 'login' ? 'Bem-vindo de volta' : mode === 'register' ? 'Começar agora' : 'Redefinir Senha'}
            </h1>
            <p className="text-zinc-500 text-sm mt-2">
              {mode === 'login' ? 'Entre no seu painel' : mode === 'register' ? 'Create your free account' : 'Digite sua nova senha abaixo'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Nome Completo</label>
                <input type="text" required value={form.nome} onChange={set('nome')} placeholder="John Doe" className={inputCls} />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">E-mail</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="name@company.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                {mode === 'forgot' ? 'New Senha' : 'Senha'}
              </label>
              <input type="password" required value={form.senha} onChange={set('senha')} placeholder="••••••••" className={inputCls} />
            </div>

            {error && (
              <p className="text-primary-400 text-xs bg-primary-500/10 border border-primary-500/20 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary-500/10 disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading
                ? (serverWaking ? 'Iniciando servidor...' : 'Processando...')
                : (mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Redefinir Senha')
              }
            </button>
          </form>

          <div className="space-y-4 mt-8">
            {mode === 'login' && (
              <p className="text-center">
                <button
                  onClick={() => { setMode('forgot'); setError('') }}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-white text-xs transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </p>
            )}

            <p className="text-center text-zinc-600 text-xs">
              {mode === 'login' ? "Não tem uma conta? " : 'Já tem uma conta? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                className="text-primary-500 hover:text-primary-400 font-bold transition-colors"
              >
                {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

