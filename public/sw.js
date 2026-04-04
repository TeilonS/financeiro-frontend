/* Service Worker — lembretes de push Web Push */

const MENSAGENS = {
  dia1:  { title: 'Financeiro — Início do mês', body: 'Hora de registrar os gastos da 2ª quinzena do mês anterior!' },
  dia15: { title: 'Financeiro — Metade do mês', body: 'Hora de registrar os gastos da 1ª quinzena deste mês!' },
}

self.addEventListener('push', function (event) {
  const tag  = event.notification?.tag || (event.data ? event.data.text() : '')
  const info = MENSAGENS[tag] || MENSAGENS['dia15']

  event.waitUntil(
    self.registration.showNotification(info.title, {
      body:    info.body,
      icon:    '/favicon.svg',
      badge:   '/favicon.svg',
      tag:     tag,
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
