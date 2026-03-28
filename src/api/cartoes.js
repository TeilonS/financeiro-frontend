import api from './index'
export const listar = () => api.get('/cartoes')
export const criar = (data) => api.post('/cartoes', data)
export const atualizar = (id, data) => api.put(`/cartoes/${id}`, data)
export const deletar = (id) => api.delete(`/cartoes/${id}`)
