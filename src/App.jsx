import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Lancamentos from './pages/Lancamentos'
import Categorias from './pages/Categorias'
import Metas from './pages/Metas'
import Extrato from './pages/Extrato'
import Relatorios from './pages/Relatorios'
import Recorrencias from './pages/Recorrencias'
import Cartoes from './pages/Cartoes'
import Orcamentos from './pages/Orcamentos'
import Backup from './pages/Backup'

// Lê diretamente do localStorage para evitar race condition com o estado React
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="lancamentos" element={<Lancamentos />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="cartoes" element={<Cartoes />} />
              <Route path="orcamentos" element={<Orcamentos />} />
              <Route path="metas" element={<Metas />} />
              <Route path="extrato" element={<Extrato />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="recorrencias" element={<Recorrencias />} />
              <Route path="backup" element={<Backup />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
