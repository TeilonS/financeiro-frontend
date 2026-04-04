import api from './index'

export const getVapidPublicKey = () =>
  api.get('/notificacoes/vapid-public-key')

export const subscribe = (subscription) =>
  api.post('/notificacoes/subscribe', subscription)

export const unsubscribe = (endpoint) =>
  api.delete('/notificacoes/subscribe', { data: { endpoint } })
