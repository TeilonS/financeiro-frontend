import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Tag, AlertCircle, ChevronRight } from 'lucide-react'
import Modal from '../components/Modal'
import * as catApi from '../api/categorias'

const EMPTY_FORM = { nome: '', tipo: 'DESPESA', cor: '#6366f1', categoriaPaiId: '' }

const inputCls = 'w-full px-4 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletandoId, setDeletandoId] = useState(null)

  async function loadCategorias() {
    setLoading(true); setError('')
    try {
      const res = await catApi.listar()
      setCategorias(res.data || [])
    } catch { setError('Erro ao carregar categorias.') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCategorias() }, [])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  function openNew() { setForm(EMPTY_FORM); setFormError(''); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      await catApi.criar({
        nome: form.nome, tipo: form.tipo, cor: form.cor,
        categoriaPaiId: form.categoriaPaiId ? parseInt(form.categoriaPaiId) : null
      })
      setModalOpen(false); loadCategorias()
    } catch (err) { setFormError(err.response?.data?.mensagem || 'Erro ao criar categoria.') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id) {
    try { await catApi.deletar(id); setDeletandoId(null); loadCategorias() }
    catch (err) { setError(err.response?.data?.mensagem || 'Erro ao excluir categoria.') }
  }

  // Separate roots and subcategories
  const roots = categorias.filter(c => !c.categoriaPaiId)
  const despesas = roots.filter(c => c.tipo === 'DESPESA')
  const receitas = roots.filter(c => c.tipo === 'RECEITA')
  const subcats = categorias.filter(c => c.categoriaPaiId)

  // For parent selector in form: only same type, only roots (no sub-sub)
  const possiveisPais = categorias.filter(c => c.tipo === form.tipo && !c.categoriaPaiId)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Categorias</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Organize seus lançamentos por categoria</p>
        </div>
        <button onClick={openNew}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={28} className="animate-spin text-primary-500" /></div>
      ) : categorias.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-16 text-center">
          <Tag size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma categoria cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">Crie categorias para organizar seus lançamentos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {despesas.length > 0 && (
            <CategoryGroup
              title="Despesas" categories={despesas} subcats={subcats}
              deletandoId={deletandoId} setDeletandoId={setDeletandoId} handleDelete={handleDelete}
            />
          )}
          {receitas.length > 0 && (
            <CategoryGroup
              title="Receitas" categories={receitas} subcats={subcats}
              deletandoId={deletandoId} setDeletandoId={setDeletandoId} handleDelete={handleDelete}
            />
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova categoria">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nome</label>
            <input type="text" required value={form.nome} onChange={set('nome')} placeholder="Ex: Alimentação, Salário..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tipo</label>
            <select value={form.tipo} onChange={set('tipo')} className={inputCls}>
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Subcategoria de (opcional)
            </label>
            <select value={form.categoriaPaiId} onChange={set('categoriaPaiId')} className={inputCls}>
              <option value="">Categoria raiz</option>
              {possiveisPais.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Cor</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.cor} onChange={set('cor')}
                className="w-12 h-10 rounded-lg border border-zinc-700 cursor-pointer p-1 dark:bg-zinc-800" />
              <span className="text-sm text-zinc-500">{form.cor}</span>
            </div>
          </div>
          {formError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{formError}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-sm font-medium">Cancelar</button>
            <button type="submit" disabled={formLoading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {formLoading && <Loader2 size={14} className="animate-spin" />}
              Criar categoria
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CategoryGroup({ title, categories, subcats, deletandoId, setDeletandoId, handleDelete }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id}>
            <CategoryCard cat={c} deletandoId={deletandoId} setDeletandoId={setDeletandoId} handleDelete={handleDelete} isRoot />
            {subcats.filter(s => s.categoriaPaiId === c.id).map(s => (
              <div key={s.id} className="ml-6 mt-1.5 flex items-center gap-2">
                <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 shrink-0" />
                <CategoryCard cat={s} deletandoId={deletandoId} setDeletandoId={setDeletandoId} handleDelete={handleDelete} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ cat, deletandoId, setDeletandoId, handleDelete, isRoot }) {
  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex items-center justify-between group ${isRoot ? '' : 'py-3'}`}>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.cor || '#6366f1' }} />
        <div>
          <p className="text-sm font-medium text-zinc-200">{cat.nome}</p>
          <span className={`text-xs font-medium ${cat.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-500'}`}>{cat.tipo}</span>
        </div>
      </div>
      {deletandoId === cat.id ? (
        <div className="flex items-center gap-1.5">
          <button onClick={() => handleDelete(cat.id)} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg">Sim</button>
          <button onClick={() => setDeletandoId(null)} className="text-xs text-slate-600 text-zinc-300 bg-slate-100 bg-zinc-700 hover:bg-slate-200 px-2 py-1 rounded-lg">Não</button>
        </div>
      ) : (
        <button onClick={() => setDeletandoId(cat.id)}
          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
