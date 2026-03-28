import api from './index'
export const listar = () => api.get('/recorrencias')
export const criar = (data) => api.post('/recorrencias', data)
export const desativar = (id) => api.delete(`/recorrencias/${id}`)
export const gerar = (mes, ano) => api.post('/recorrencias/gerar', null, { params: { mes, ano } })
