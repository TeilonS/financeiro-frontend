import api from './index'
export const listar = (mes, ano) => api.get('/orcamentos', { params: { mes, ano } })
export const salvar = (data) => api.post('/orcamentos', data)
export const deletar = (id) => api.delete(`/orcamentos/${id}`)
