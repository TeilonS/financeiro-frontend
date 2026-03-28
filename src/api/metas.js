import api from './index'
export const listar = () => api.get('/metas')
export const criar = (data) => api.post('/metas', data)
export const deletar = (id) => api.delete(`/metas/${id}`)
export const alertas = (params) => api.get('/metas/alertas', { params })
