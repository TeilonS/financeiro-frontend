import api from './index'
export const getReserva = () => api.get('/usuarios/reserva-emergencia')
export const atualizarReserva = (valor) => api.put('/usuarios/reserva-emergencia', { valor })
export const patrimonio = () => api.get('/usuarios/patrimonio')
