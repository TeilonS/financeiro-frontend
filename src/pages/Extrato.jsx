import { useState, useEffect, useRef } from 'react'
import { FileUp, Loader2, CheckCircle, XCircle, AlertCircle, Upload, CheckSquare } from 'lucide-react'
import Modal from '../components/Modal'
import * as extratoApi from '../api/extrato'
import * as catApi from '../api/categorias'
import { fmt, formatDate } from '../utils/formatters'

const FORMATOS = [
  { value: 'OFX', label: 'OFX' },
  { value: 'CSV_INTER', label: 'CSV Inter' },
  { value: 'CSV_C6', label: 'CSV C6' },
  { value: 'CSV_NUBANK', label: 'CSV Nubank' },
  { value: 'CSV_ITAU', label: 'CSV Itaú' },
]

export default function Extrato() {
  const [formato, setFormato] = useState('OFX')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const [pendentesExist, setPendentesExist] = useState([])
  const [pendentesLoading, setPendentesLoading] = useState(true)
  const [categorias, setCategorias] = useState([])
  const [confirmModal, setConfirmModal] = useState(null)
  const [confirmCatId, setConfirmCatId] = useState('')
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef()
  const [selecionados, setSelecionados] = useState([])
  const [loteCategoria, setLoteCategoria] = useState('')
  const [loteLoading, setLoteLoading] = useState(false)

  async function loadPendentes() {
    setPendentesLoading(true)
    try {
      const [resPend, resCats] = await Promise.all([extratoApi.pendentes(), catApi.listar()])
      setPendentesExist(resPend.data || [])
      setCategorias(resCats.data || [])
    } catch {
      setError('Erro ao carregar transações pendentes. Tente recarregar a página.')
    } finally {
      setPendentesLoading(false)
    }
  }

  useEffect(() => { loadPendentes() }, [])

  async function handleFile(file) {
    if (!file) return
    setUploadError('')
    setUploadLoading(true)
    try {
      const res = await extratoApi.upload(file, formato)
      setUploadResult(res.data)
    } catch (err) {
      setUploadError(err.response?.data?.mensagem || 'Erro ao importar arquivo. Verifique o formato selecionado.')
    } finally {
      setUploadLoading(false)
    }
  }

  function onFileInput(e) { handleFile(e.target.files?.[0]); e.target.value = '' }

  function onDrop(e) {
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0])
  }

  function openConfirm(item) {
    setConfirmCatId(item.categoriaSugeridaId ? String(item.categoriaSugeridaId) : '')
    setConfirmModal(item)
  }

  async function handleConfirmar() {
    if (!confirmModal) return
    setConfirmLoading(true)
    try {
      await extratoApi.confirmar(confirmModal.id, confirmCatId ? parseInt(confirmCatId) : null)
      setConfirmModal(null)
      setUploadResult(prev => prev ? { ...prev, transacoes: prev.transacoes.filter(i => i.id !== confirmModal.id) } : prev)
      setPendentesExist(prev => prev.filter(i => i.id !== confirmModal.id))
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao confirmar transação.')
    } finally {
      setConfirmLoading(false)
    }
  }

  async function handleConfirmarLote() {
    if (!selecionados.length || !loteCategoria) return
    setLoteLoading(true)
    try {
      const itens = selecionados.map(id => ({ id, categoriaId: parseInt(loteCategoria) }))
      await extratoApi.confirmarLote(itens)
      setSelecionados([]); setLoteCategoria('')
      setPendentesExist(prev => prev.filter(i => !selecionados.includes(i.id)))
      setUploadResult(prev => prev ? { ...prev, transacoes: prev.transacoes.filter(i => !selecionados.includes(i.id)) } : prev)
    } catch { setError('Erro ao confirmar em lote.') }
    finally { setLoteLoading(false) }
  }

  function toggleSelecionado(id) {
    setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleIgnorar(item, fromUpload) {
    try {
      await extratoApi.ignorar(item.id)
      if (fromUpload) {
        setUploadResult(prev => prev ? { ...prev, transacoes: prev.transacoes.filter(i => i.id !== item.id) } : prev)
      } else {
        setPendentesExist(prev => prev.filter(i => i.id !== item.id))
      }
    } catch { setError('Erro ao ignorar transação.') }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Importar Extrato</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Importe seu extrato bancário para classificar transações</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Novo arquivo</h2>

        <div className="flex gap-2 mb-5">
          {FORMATOS.map(f => (
            <button key={f.value} onClick={() => setFormato(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                formato === f.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-zinc-700 hover:border-primary-300 hover:bg-zinc-800'
          }`}
        >
          {uploadLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-zinc-500">Processando arquivo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <FileUp size={22} className="text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">Arraste ou clique para selecionar</p>
                <p className="text-xs text-zinc-500 mt-1">Formato selecionado: <strong>{FORMATOS.find(f => f.value === formato)?.label}</strong></p>
              </div>
              <button type="button"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                <Upload size={14} /> Selecionar arquivo
              </button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" className="hidden" onChange={onFileInput} accept=".ofx,.csv" />

        {uploadError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} />{uploadError}
          </div>
        )}

        {uploadResult && (
          <div className="mt-5 space-y-3">
            <div className="bg-zinc-800 dark:bg-zinc-800 border border-zinc-800 rounded-xl px-4 py-3 text-sm flex flex-wrap gap-4">
              <span className="text-zinc-300">
                <strong className="text-zinc-500 dark:text-white">{uploadResult.totalTransacoes}</strong> transações importadas
              </span>
              {uploadResult.autoConfirmadas > 0 && (
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={14} />
                  <strong>{uploadResult.autoConfirmadas}</strong> categorizadas automaticamente
                </span>
              )}
              {uploadResult.transacoes?.length > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  <strong>{uploadResult.transacoes.length}</strong> aguardando classificação
                </span>
              )}
            </div>

            {uploadResult.transacoes?.length > 0 ? (
              <PendentesList
                items={uploadResult.transacoes} categorias={categorias}
                onConfirmar={openConfirm} onIgnorar={(item) => handleIgnorar(item, true)}
                selecionados={selecionados} onToggle={toggleSelecionado}
              />
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle size={16} /> Todas as transações foram classificadas automaticamente.
              </div>
            )}
          </div>
        )}
      </div>

      {selecionados.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
          <CheckSquare size={16} className="text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">{selecionados.length} selecionada(s)</span>
          <select
            value={loteCategoria} onChange={e => setLoteCategoria(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-1.5 border border-primary-200 dark:border-primary-700 rounded-xl text-sm bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500">
            <option value="">Selecionar categoria...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>)}
          </select>
          <button onClick={handleConfirmarLote} disabled={!loteCategoria || loteLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2">
            {loteLoading && <Loader2 size={13} className="animate-spin" />}
            Confirmar todas
          </button>
          <button onClick={() => setSelecionados([])} className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-700">Cancelar</button>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Pendentes anteriores</h2>
        {pendentesLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        ) : pendentesExist.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">Nenhuma transação pendente.</p>
        ) : (
          <PendentesList
            items={pendentesExist} categorias={categorias}
            onConfirmar={openConfirm} onIgnorar={(item) => handleIgnorar(item, false)}
            selecionados={selecionados} onToggle={toggleSelecionado}
          />
        )}
      </div>

      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirmar transação" maxWidth="max-w-md">
        {confirmModal && (
          <div className="space-y-4">
            <div className="bg-zinc-800 dark:bg-zinc-800 rounded-xl p-4 text-sm">
              <p className="font-medium text-zinc-200">{confirmModal.descricao}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-zinc-500">{formatDate(confirmModal.data)}</span>
                <span className={`font-semibold ${confirmModal.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {fmt(confirmModal.valor)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Categoria</label>
              <select
                value={confirmCatId} onChange={(e) => setConfirmCatId(e.target.value)}
                className="w-full px-4 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500">
                <option value="">Sem categoria</option>
                {categorias
                  .filter(c => !confirmModal.tipo || c.tipo === confirmModal.tipo)
                  .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmar} disabled={confirmLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {confirmLoading && <Loader2 size={14} className="animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function PendentesList({ items, categorias, onConfirmar, onIgnorar, selecionados = [], onToggle }) {
  return (
    <div className="divide-y divide-zinc-800">
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between py-3 gap-3">
          {onToggle && (
            <input type="checkbox" checked={selecionados.includes(item.id)} onChange={() => onToggle(item.id)}
              className="w-4 h-4 rounded border-zinc-700 text-primary-600 cursor-pointer shrink-0" />
          )}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${item.tipo === 'RECEITA' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{item.descricao}</p>
              <p className="text-xs text-zinc-500">
                {formatDate(item.data)}
                {item.categoriaSugeridaNome && (
                  <span className="ml-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded font-medium">
                    {item.categoriaSugeridaNome}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-sm font-semibold ${item.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>
              {fmt(item.valor)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.tipo === 'RECEITA' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
              {item.tipo}
            </span>
            <button onClick={() => onConfirmar(item)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
              <CheckCircle size={12} /> Confirmar
            </button>
            <button onClick={() => onIgnorar(item)}
              className="border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
              <XCircle size={12} /> Ignorar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
