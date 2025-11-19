import browser from 'webextension-polyfill'

/**
 * Content script bridge - écoute les messages de la page web (Annoncify)
 * et les transmet au background script
 */

console.log('[Annoncify] Bridge content script loaded')

// Injecter un signal pour indiquer que l'extension est installée
const manifest = browser.runtime.getManifest()
window.postMessage(
  {
    type: 'ANNONCIFY_EXTENSION_INSTALLED',
    version: manifest.version,
    extensionId: browser.runtime.id,
  },
  '*'
)

// Écouter les messages de la page web
window.addEventListener('message', async (event) => {
  // Vérifier l'origine du message (seulement depuis localhost:3000 en dev)
  if (event.source !== window) return

  const message = event.data

  // Gérer les différents types de messages
  if (message.type === 'ANNONCIFY_PING') {
    // Répondre au ping avec les infos de l'extension
    window.postMessage(
      {
        type: 'ANNONCIFY_PONG',
        version: manifest.version,
        extensionId: browser.runtime.id,
        installed: true,
      },
      '*'
    )
    return
  }

  // Vérifier que c'est un message de publication
  if (message.type !== 'ANNONCIFY_PUBLISH') return

  console.log('[Annoncify Bridge] Received publish request:', message)

  try {
    // Envoyer le message au background script
    const response = await browser.runtime.sendMessage({
      action: 'PUBLISH_LISTING',
      payload: message.payload,
      timestamp: message.timestamp,
      requestId: message.requestId,
    })

    console.log('[Annoncify Bridge] Response from background:', response)
  } catch (error) {
    console.error('[Annoncify Bridge] Error:', error)
  }
})

export {}
