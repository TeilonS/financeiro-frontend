import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Receipt, Tag, Target,
  FileUp, BarChart2, RefreshCw, LogOut, Wallet, CreditCard, PiggyBank, Moon, Sun, HardDrive
} from 'lucide-react'

const links = [
  { to: '/',             label: 'Dashboard',    Icon: LayoutDashboard, exact: true },
  { to: '/lancamentos',  label: 'Lançamentos',  Icon: Receipt },
  { to: '/categorias',   label: 'Categorias',   Icon: Tag },
  { to: '/cartoes',      label: 'Cartões',      Icon: CreditCard },
  { to: '/orcamentos',   label: 'Orçamentos',   Icon: PiggyBank },
  { to: '/metas',        label: 'Metas',        Icon: Target },
  { to: '/extrato',      label: 'Extrato',      Icon: FileUp },
  { to: '/relatorios',   label: 'Relatórios',   Icon: BarChart2 },
  { to: '/recorrencias', label: 'Recorrências', Icon: RefreshCw },
  { to: '/backup',       label: 'Backup',       Icon: HardDrive },
  { to: '/investimentos', label: 'Investimentos', Icon: PiggyBank },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <aside className="w-64 bg-white dark:bg-[#0A0A0A] flex flex-col shrink-0 border-r border-zinc-200 dark:border-white/5 transition-colors duration-300">

      {/* Marca */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/20">
            <Wallet size={16} className="text-white" />
          </div>
          <div>
            <p className="font-sans font-bold text-zinc-900 dark:text-white text-base leading-none tracking-tight">Financeiro</p>
            <p className="text-[10px] text-zinc-500 mt-1 tracking-[0.2em] uppercase font-bold">Inteligente</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto border-zinc-100 dark:border-transparent">
        {links.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500/10 text-primary-600 dark:text-white font-bold shadow-sm border border-primary-500/10'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-primary-500' : 'group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors'} />
                <span>{label}</span>
                {isActive && (
                   <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-zinc-100 dark:border-white/5 space-y-1">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 text-sm font-medium transition-all"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{dark ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-4 mb-2">
          <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-zinc-900 dark:text-white text-xs font-bold truncate">{user?.nome || 'Usuário'}</p>
            <p className="text-[10px] text-zinc-500 font-medium">Membro Premium</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/5 text-sm font-medium transition-all"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
