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
    <aside className="w-56 bg-[#09090B] flex flex-col shrink-0 border-r border-zinc-800/60">

      {/* Marca */}
      <div className="px-5 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          {/* Ícone geométrico — identidade visual */}
          <div className="w-7 h-7 bg-primary-500 rounded-md flex items-center justify-center shrink-0">
            <Wallet size={14} className="text-zinc-900" />
          </div>
          <div>
            <p className="font-display font-700 text-white text-sm leading-none tracking-tight">Financeiro</p>
            <p className="text-2xs text-zinc-500 mt-0.5 tracking-widest uppercase font-medium">Pessoal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100 ${
                isActive
                  ? 'bg-zinc-800/50 text-white font-medium'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30 font-normal'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-400 rounded-full" />
                )}
                <Icon size={15} className={isActive ? 'text-primary-400' : ''} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-zinc-800/60 space-y-0.5">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30 text-sm transition-all"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? 'Modo claro' : 'Modo escuro'}
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center text-white text-2xs font-bold shrink-0 font-display">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-zinc-300 text-xs font-medium truncate">{user?.nome || 'Usuário'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800/30 text-sm transition-all"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )
}
