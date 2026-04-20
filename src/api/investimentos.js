import api from './index'

export const listar = () => api.get('/investimentos')
export const criar = (dados) => api.post('/investimentos', dados)
export const deletar = (id) => api.delete(`/investimentos/${id}`)
export const registrarSnapshot = (id, dados) => api.post(`/investimentos/${id}/snapshot`, dados)
export const listarHistorico = (id) => api.get(`/investimentos/${id}/historico`)
