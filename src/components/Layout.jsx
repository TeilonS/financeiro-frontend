import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#050505] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#050505]">
        <Outlet />
      </main>
    </div>
  )
}
