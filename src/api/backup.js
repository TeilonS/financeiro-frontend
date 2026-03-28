import api from './index'
export const exportar = () => api.get('/backup/exportar')
export const importar = (data) => api.post('/backup/importar', data)
