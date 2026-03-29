import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'
import { Wallet, Loader2 } from 'lucide-react'

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (localStorage.getItem('token')) return <Navigate to="/" replace />

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
      setError(err.response?.data?.mensagem || 'Erro ao entrar. Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-primary-900/50">
            <Wallet size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financeiro Pessoal</h1>
          <p className="text-slate-400 text-sm mt-1">Controle total das suas finanças</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setMode('login')}
            >Entrar</button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              onClick={() => setMode('register')}
            >Criar conta</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome</label>
                <input type="text" required value={form.nome} onChange={set('nome')} placeholder="Seu nome completo" className={inputCls} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={set('email')} placeholder="seu@email.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
              <input type="password" required value={form.senha} onChange={set('senha')} placeholder="••••••••" className={inputCls} />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-primary-900/30">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
