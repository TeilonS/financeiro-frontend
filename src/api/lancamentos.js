import api from './index'
export const listar = (params) => api.get('/lancamentos', { params })
export const criar = (data) => api.post('/lancamentos', data)
export const atualizar = (id, data) => api.put(`/lancamentos/${id}`, data)
export const deletar = (id) => api.delete(`/lancamentos/${id}`)
export const resumo = (params) => api.get('/resumo', { params })
export const exportarCsv = (params) => api.get('/lancamentos/exportar.csv', {
  params, responseType: 'blob'
})
