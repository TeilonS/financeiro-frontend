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
    <aside className="w-64 bg-slate-950 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/40">
          <Wallet size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">Financeiro</p>
          <p className="text-primary-400 text-xs mt-0.5 font-medium">Pessoal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Theme toggle */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 text-sm transition-all mb-1"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? 'Modo claro' : 'Modo escuro'}
        </button>

        <div className="flex items-center gap-3 px-3 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.nome || 'Usuário'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 text-sm transition-all"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
