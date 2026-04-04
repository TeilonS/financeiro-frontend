import { useState, useEffect } from 'react'
import { getVapidPublicKey, subscribe, unsubscribe } from '../api/notificacoes'

/** Converte base64url para Uint8Array (necessário para a subscription API) */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

/**
 * status: 'unsupported' | 'idle' | 'loading' | 'active' | 'denied'
 */
export function usePushNotification() {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    // Verifica se já tem subscrição ativa
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => {
      if (sub) setStatus('active')
    }).catch(() => {})
  }, [])

  async function ativar() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    setStatus('loading')
    try {
      // 1. Registrar Service Worker
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready

      // 2. Pedir permissão
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setStatus('denied')
        return
      }

      // 3. Buscar chave pública VAPID
      const { data } = await getVapidPublicKey()
      const appKey = urlBase64ToUint8Array(data.publicKey)

      // 4. Criar subscrição
      const pushSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appKey,
      })

      // 5. Enviar subscrição ao backend
      const json = pushSub.toJSON()
      await subscribe({
        endpoint: pushSub.endpoint,
        p256dh:   json.keys.p256dh,
        auth:     json.keys.auth,
      })

      setStatus('active')
    } catch (err) {
      console.error('Erro ao ativar push:', err)
      setStatus('idle')
    }
  }

  async function desativar() {
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const pushSub = await reg.pushManager.getSubscription()
      if (pushSub) {
        await unsubscribe(pushSub.endpoint)
        await pushSub.unsubscribe()
      }
      setStatus('idle')
    } catch (err) {
      console.error('Erro ao desativar push:', err)
      setStatus('active')
    }
  }

  return { status, ativar, desativar }
}
