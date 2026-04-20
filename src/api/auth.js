import api from './index'
export const login = (email, senha) => api.post('/auth/login', { email, senha })
export const register = (nome, email, senha) => api.post('/auth/register', { nome, email, senha })
export const forgotPassword = (email, novaSenha) => api.post('/auth/forgot-password', { email, novaSenha })
