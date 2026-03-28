import api from './index'
export const upload = (arquivo, formato) => {
  const form = new FormData()
  form.append('arquivo', arquivo)
  return api.post(`/extrato/upload?formato=${formato}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const preview = (arquivo, formato) => {
  const form = new FormData()
  form.append('arquivo', arquivo)
  return api.post(`/extrato/preview?formato=${formato}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const pendentes = () => api.get('/extrato/pendentes')
export const confirmar = (id, categoriaId) => api.post(`/extrato/pendentes/${id}/confirmar`, { categoriaId })
export const ignorar = (id) => api.post(`/extrato/pendentes/${id}/ignorar`)
export const confirmarLote = (itens) => api.post('/extrato/pendentes/confirmar-lote', itens)
