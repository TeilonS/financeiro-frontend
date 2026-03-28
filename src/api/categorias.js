import api from './index'
export const listar = () => api.get('/categorias')
export const criar = (data) => api.post('/categorias', data)
export const deletar = (id) => api.delete(`/categorias/${id}`)
