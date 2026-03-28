import api from './index'
export const evolucao = (ano) => api.get('/relatorios/evolucao', { params: { ano } })
export const topCategorias = (params) => api.get('/relatorios/top-categorias', { params })
export const comparativo = (params) => api.get('/relatorios/comparativo', { params })
export const previsao = (mes, ano) => api.get('/relatorios/previsao', { params: { mes, ano } })
