import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'

const Dashboard    = lazy(() => import('./pages/Dashboard'))
const Lancamentos  = lazy(() => import('./pages/Lancamentos'))
const Categorias   = lazy(() => import('./pages/Categorias'))
const Metas        = lazy(() => import('./pages/Metas'))
const Extrato      = lazy(() => import('./pages/Extrato'))
const Relatorios   = lazy(() => import('./pages/Relatorios'))
const Recorrencias = lazy(() => import('./pages/Recorrencias'))
const Cartoes      = lazy(() => import('./pages/Cartoes'))
const Orcamentos   = lazy(() => import('./pages/Orcamentos'))
const Backup       = lazy(() => import('./pages/Backup'))

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '13px', borderRadius: '12px' },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
              <Route path="lancamentos" element={<Suspense fallback={<PageLoader />}><Lancamentos /></Suspense>} />
              <Route path="categorias" element={<Suspense fallback={<PageLoader />}><Categorias /></Suspense>} />
              <Route path="cartoes" element={<Suspense fallback={<PageLoader />}><Cartoes /></Suspense>} />
              <Route path="orcamentos" element={<Suspense fallback={<PageLoader />}><Orcamentos /></Suspense>} />
              <Route path="metas" element={<Suspense fallback={<PageLoader />}><Metas /></Suspense>} />
              <Route path="extrato" element={<Suspense fallback={<PageLoader />}><Extrato /></Suspense>} />
              <Route path="relatorios" element={<Suspense fallback={<PageLoader />}><Relatorios /></Suspense>} />
              <Route path="recorrencias" element={<Suspense fallback={<PageLoader />}><Recorrencias /></Suspense>} />
              <Route path="backup" element={<Suspense fallback={<PageLoader />}><Backup /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
