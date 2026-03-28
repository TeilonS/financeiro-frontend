import api from './index'
export const login = (email, senha) => api.post('/auth/login', { email, senha })
export const register = (nome, email, senha) => api.post('/auth/register', { nome, email, senha })
